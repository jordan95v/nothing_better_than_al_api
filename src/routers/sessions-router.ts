import { Router, Request, Response } from "express"
import { prisma } from ".."
import {
  SessionGetRequest,
  sessionGetValidator,
} from "../validators/sessions-validator"
import Joi from "joi"
import { SessionWithFilm } from "../models"

export const sessionsRouter = Router()

sessionsRouter.get("/", async (req: Request, res: Response) => {
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
