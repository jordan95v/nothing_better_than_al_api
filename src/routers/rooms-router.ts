import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Room, Session } from "@prisma/client"
import {
  RoomGetRequest,
  RoomIdGetRequest,
  roomGetValidator,
  roomIdGetValidator,
} from "../validators/rooms-validator"
import Joi from "joi"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"
import { handleError } from "../errors/handle-error"

export const roomsRouter = Router()

roomsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<RoomGetRequest> =
    roomGetValidator.validate(req.query)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const limit: number = validation.value.limit ?? 10
    const page: number = validation.value.page ?? 0
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
