import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Room, Session } from "@prisma/client"
import {
  RoomIdGetRequest,
  roomIdGetValidator,
} from "../validators/rooms-validator"
import Joi from "joi"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../errors/generate-error-message"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"

export const roomsRouter = Router()

roomsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms: Room[] | null = await prisma.room.findMany({
      where: { maintenance: false },
    })
    res.status(200).send(rooms)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
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
      res.status(500).send({ message: "Something went wrong" })
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
    if (error instanceof PrismaClientKnownRequestError) {
      const prismaError: HttpError = generatePrismaErrorMessage(error)
      res.status(prismaError.status).send(prismaError)
      return
    }
    res.status(500).send({ message: "Something went wrong" })
  }
})
