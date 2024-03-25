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
  PrismaError,
  generatePrismaErrorMessage,
} from "../../validators/admin/generate-prisma-error-message"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const adminUsersRouter = Router()

adminUsersRouter.get(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const users: User[] = await prisma.user.findMany()
    res.send({ users: users })
  }
)

adminUsersRouter.get(
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
    res.send({ user: user })
  }
)

adminUsersRouter.patch(
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
      res.send({ message: "User updated", data: updatedUser })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: PrismaError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)

adminUsersRouter.delete(
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
      res.send({ message: "User deleted", user: deletedUser })
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)
