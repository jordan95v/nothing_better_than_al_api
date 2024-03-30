import { Router, Request, Response } from "express"
import { User } from "@prisma/client"
import { prisma } from "../.."
import {
  UserAdminUpdateRequest,
  userAdminUpdateValidator,
} from "../../validators/admin/users-validator"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import Joi from "joi"
import { generateValidationErrorMessage } from "../../validators/generate-validation-message"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../../validators/generate-error-message"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { UserAll } from "../../models"

export const usersAdminRouter = Router()

usersAdminRouter.get(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const users: User[] = await prisma.user.findMany()
    res.status(200).send(users)
  }
)

usersAdminRouter.get(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const user: User | null = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    })
    if (user === null) {
      return res.status(404).send({ message: "User not found" })
    }
    res.status(200).send(user)
  }
)

usersAdminRouter.get(
  "/:id/transactions",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const user: UserAll | null = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { transactions: true, tickets: true, tokens: true },
    })
    if (user === null) {
      return res.status(404).send({ message: "User not found" })
    }
    res.status(200).send(user.transactions)
  }
)

usersAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserAdminUpdateRequest> =
      userAdminUpdateValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: Number(req.params.id),
      },
    })
    if (user === null) {
      return res.status(404).send({ message: "User not found" })
    }
    try {
      const updatedUser: User = await prisma.user.update({
        where: { id: user.id },
        data: { ...validation.value },
      })
      res.status(200).send({ message: "User updated", data: updatedUser })
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

usersAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: Number(req.params.id),
      },
    })
    if (user === null) {
      return res.status(404).send({ message: "User not found" })
    }
    try {
      const deletedUser: User = await prisma.user.delete({
        where: { id: user.id },
      })
      res.status(200).send({ message: "User deleted", user: deletedUser })
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)
