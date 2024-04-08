import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Room, Session } from "@prisma/client"
import {
  RoomGetRequest,
  RoomIdGetRequest,
  RoomIdSatisticsRequest,
  roomGetValidator,
  roomIdGetStatisticsValidator,
  roomIdGetValidator,
} from "../validators/rooms-validator"
import Joi from "joi"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"
import { handleError } from "../errors/handle-error"
import { DEFAULT_CONFIG } from "../config"

export const roomsRouter = Router()

interface SessionTicketCount {
  session: Session
  usedTickets: number
}

roomsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<RoomGetRequest> =
    roomGetValidator.validate(req.query)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const limit: number = validation.value.limit ?? DEFAULT_CONFIG.LIMIT
    const page: number = validation.value.page ?? DEFAULT_CONFIG.PAGE
    const rooms: Room[] | null = await prisma.room.findMany({
      where: { maintenance: false },
      take: limit,
      skip: page * limit,
    })
    res.status(200).send(rooms)
  } catch (error) {
    await handleError(error, res)
  }
})

roomsRouter.get(
  "/:number",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<RoomIdGetRequest> =
      roomIdGetValidator.validate({ ...req.params, ...req.query })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const room: Room | null = await prisma.room.findUnique({
        where: { number: validation.value.number },
      })
      if (room === null) {
        return res.status(404).send({ message: "Room not found" })
      }
      if (room.maintenance === true) {
        return res.status(400).send({ message: "Room in maintenance" })
      }
      res.status(200).send(room)
    } catch (error) {
      await handleError(error, res)
    }
  }
)

roomsRouter.get("/:number/statistics", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<RoomIdSatisticsRequest> =
    roomIdGetStatisticsValidator.validate({ ...req.params, ...req.query })
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const limit: number = validation.value.limit ?? DEFAULT_CONFIG.LIMIT
    const page: number = validation.value.page ?? DEFAULT_CONFIG.PAGE
    let sessionTicketCounts: SessionTicketCount[] = []
    const sessions: Session[] = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validation.value.startAt,
          lte: validation.value.endAt,
        },
        roomId: validation.value.number,
      },
      take: limit,
      skip: page * limit,
    })
    for (const session of sessions) {
      const usedTickets: number = await prisma.ticket.count({
        where: { sessionId: session.id, used: true },
      })
      sessionTicketCounts.push({ session, usedTickets })
    }
    res.status(200).send(sessionTicketCounts)
  } catch (error) {
    await handleError(error, res)
  }
})

roomsRouter.get("/:number/sessions", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<RoomIdGetRequest> =
    roomIdGetValidator.validate({ ...req.params, ...req.query })
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const sessions: Session[] = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validation.value.startDate,
          lte: validation.value.endDate,
        },
        roomId: validation.value.number,
      },
      include: { film: true },
    })
    res.status(200).send(sessions)
  } catch (error) {
    await handleError(error, res)
  }
})
