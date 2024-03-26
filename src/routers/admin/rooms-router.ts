import { Router, Request, Response } from "express"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import {
  RoomCreateRequest,
  RoomUpdateRequest,
  roomCreateValidator,
  roomUpdateValidator,
} from "../../validators/admin/rooms-validator"
import { generateValidationErrorMessage } from "../../validators/generate-validation-message"
import { prisma } from "../.."
import Joi from "joi"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../../validators/generate-error-message"

export const roomsAdminRouter = Router()

roomsAdminRouter.post(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<RoomCreateRequest> =
      roomCreateValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const room = await prisma.room.create({
        data: { ...validation.value },
      })
      return res.send({ message: "Room created", data: room })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      return res.status(500).send({ message: "Something went wrong" })
    }
  }
)

roomsAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const id: number = Number(req.params.id)
    const validation: Joi.ValidationResult<RoomUpdateRequest> =
      roomUpdateValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const room = await prisma.room.update({
        where: { id: id },
        data: { ...validation.value },
      })
      res.send({ message: "Room updated", data: room })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)

roomsAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const id: number = Number(req.params.id)
    try {
      await prisma.room.delete({
        where: { id: id },
      })
      res.send({ message: "Room deleted" })
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)
