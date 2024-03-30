import { Router, Request, Response } from "express"
import { prisma } from ".."
import {
  SessionGetRequest,
  SessionIdGetRequest,
  sessionGetValidator,
  sessionIdGetValidator,
} from "../validators/sessions-validator"
import Joi from "joi"
import { SessionWithAll } from "../models"
import { authMiddleware } from "../middlewares/auth-middleware"
import { Transaction, TransactionType } from "@prisma/client"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"

export const sessionsRouter = Router()

sessionsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const validator: Joi.ValidationResult<SessionGetRequest> =
    sessionGetValidator.validate(req.query)
  try {
    const sessions: SessionWithAll[] = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validator.value.startAt,
          lte: validator.value.endAt,
        },
      },
      include: { film: true, room: true, tickets: true },
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
    const validation: Joi.ValidationResult<SessionIdGetRequest> =
      sessionIdGetValidator.validate({ ...req.params, ...req.query })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    const session: SessionWithAll | null = await prisma.session.findUnique({
      where: { id: validation.value.id },
      include: { film: true, room: true, tickets: true },
    })
    if (session === null) {
      res.status(404).send({ message: "Session not found" })
      return
    }
    if (session.room.basePrice > req.user.money) {
      res.status(400).send({ message: "Not enough money" })
      return
    }
    if (session.room.capacity <= session.tickets.length) {
      res.status(400).send({ message: "Room is full" })
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
              sessionId: validation.value.id,
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
