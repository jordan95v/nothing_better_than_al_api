import { Router, Request, Response } from "express"
import { prisma } from ".."
import {
  SessionGetRequest,
  sessionGetValidator,
} from "../validators/sessions-validator"
import Joi from "joi"
import { SessionWithFilm, SessionWithRoom } from "../models"
import { authMiddleware } from "../middlewares/auth-middleware"
import { Transaction, TransactionType } from "@prisma/client"

export const sessionsRouter = Router()

sessionsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const validator: Joi.ValidationResult<SessionGetRequest> =
    sessionGetValidator.validate(req.query)
  try {
    const sessions: SessionWithFilm[] = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validator.value.startAt,
          lte: validator.value.endAt,
        },
      },
      include: { film: true, room: true },
    })
    res.status(200).send(sessions)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

sessionsRouter.post(
  "/:id/buy",
  authMiddleware,
  async (req: Request, res: Response) => {
    const session: SessionWithRoom | null = await prisma.session.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { room: true },
    })
    if (session === null) {
      res.status(404).send({ message: "Session not found" })
      return
    }
    if (session.room.basePrice > req.user.money) {
      res.status(400).send({ message: "Not enough money" })
      return
    }
    try {
      const transaction: Transaction = await prisma.transaction.create({
        data: {
          amount: session.room.basePrice,
          userId: req.user.id,
          type: TransactionType.BUY,
          ticket: {
            create: {
              sessionId: parseInt(req.params.id),
              userId: req.user.id,
            },
          },
        },
        include: { ticket: true },
      })
      await prisma.user.update({
        where: { id: req.user.id },
        data: { money: { decrement: session.room.basePrice } },
      })
      res.status(201).send({
        message: "Ticket bought",
        oldMoney: req.user.money,
        newMoney: req.user.money - session.room.basePrice,
        transaction,
      })
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)
