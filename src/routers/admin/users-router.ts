import { Router, Request, Response } from "express"
import { Role, User } from "@prisma/client"
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
        data: {
          email: validation.value.email,
          firstName: validation.value.firstName,
          lastName: validation.value.lastName,
          role: validation.value.role === "ADMIN" ? Role.ADMIN : Role.USER,
        },
      })
      res.send({ message: "User updated", data: updatedUser })
    } catch (error) {
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
