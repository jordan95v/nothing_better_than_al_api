import { Router, Request, Response } from "express"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import {
  RoomCreateRequest,
  RoomIdAdminRequest,
  RoomUpdateRequest,
  roomCreateValidator,
  roomIdAdminValidator,
  roomUpdateValidator,
} from "../../validators/admin/rooms-validator"
import { generateValidationErrorMessage } from "../../errors/generate-validation-message"
import { prisma } from "../.."
import Joi from "joi"
import { Room } from "@prisma/client"
import { handleError } from "../../errors/handle-error"
import { roomBasePrice } from "../../config"

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
      const basePrice: number = roomBasePrice[validation.value.type]
      const room: Room = await prisma.room.create({
        data: { ...validation.value, basePrice },
      })
      return res.status(200).send({ message: "Room created", data: room })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

roomsAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<RoomUpdateRequest> =
      roomUpdateValidator.validate({ ...req.params, ...req.body })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const room = await prisma.room.update({
        where: { id: validation.value.id },
        data: {
          name: validation.value.name,
          number: validation.value.number,
          description: validation.value.description,
          images: validation.value.images,
          type: validation.value.type,
          capacity: validation.value.capacity,
          handicap: validation.value.handicap,
          maintenance: validation.value.maintenance,
        },
      })
      res.status(200).send({ message: "Room updated", data: room })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

roomsAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<RoomIdAdminRequest> =
      roomIdAdminValidator.validate(req.params)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      await prisma.room.delete({
        where: { id: validation.value.id },
      })
      res.status(200).send({ message: "Room deleted" })
    } catch (error) {
      await handleError(error, res)
    }
  }
)
