import { Router, Request, Response } from "express"
import { prisma } from ".."
import {
  SessionGetRequest,
  sessionGetValidator,
} from "../validators/sessions-validator"
import Joi from "joi"
import { MAINTENANCE_TIME } from "../validators/admin/sessions-validator"
import { Session } from "@prisma/client"
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
    let sessionsResponse: Session[] = []
    for (const session of sessions) {
      const endAt: Date = new Date(session.startAt)
      endAt.setMinutes(
        endAt.getMinutes() + session.film.duration + MAINTENANCE_TIME
      )
      if (endAt <= validator.value.endAt) {
        sessionsResponse.push(session)
      }
    }
    res.status(200).send(sessionsResponse)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})
