import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Room, Session } from "@prisma/client"
import { RoomGetRequest, roomGetValidator } from "../validators/rooms-validator"
import Joi from "joi"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../validators/generate-error-message"

export const roomsRouter = Router()

roomsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms: Room[] | null = await prisma.room.findMany()
    res.status(200).send(rooms)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

roomsRouter.get(
  "/:number",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const room: Room | null = await prisma.room.findUnique({
        where: {
          number: parseInt(req.params.number),
        },
      })
      res.status(200).send(room)
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)

roomsRouter.get("/:number/sessions", async (req: Request, res: Response) => {
  const validator: Joi.ValidationResult<RoomGetRequest> =
    roomGetValidator.validate(req.query)
  try {
    const sessions: Session[] = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validator.value.startDate,
          lte: validator.value.endDate,
        },
        roomId: parseInt(req.params.number),
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
