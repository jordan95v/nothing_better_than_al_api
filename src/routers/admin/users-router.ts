import { Router, Request, Response } from "express"
import { Transaction, User } from "@prisma/client"
import { prisma } from "../.."
import {
  UserAdminGetRequest,
  userAdminGetValidator,
  UserAdminUpdateRequest,
  userAdminUpdateValidator,
  UserIdAdminRequest,
  userIdAdminValidator,
} from "../../validators/admin/users-validator"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import Joi from "joi"
import { generateValidationErrorMessage } from "../../errors/generate-validation-message"
import { UserAll, UserWithTransactions } from "../../models"
import { handleError } from "../../errors/handle-error"

export const usersAdminRouter = Router()

usersAdminRouter.get(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserAdminGetRequest> =
      userAdminGetValidator.validate(req.query)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const limit: number = validation.value.limit ?? 10
      const page: number = validation.value.page ?? 0
      const users: User[] = await prisma.user.findMany({
        take: limit,
        skip: page * limit,
      })
      res.status(200).send(users)
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersAdminRouter.get(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserIdAdminRequest> =
      userIdAdminValidator.validate(req.params)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const user: User | null = await prisma.user.findUnique({
        where: { id: validation.value.id },
      })
      if (user === null) {
        return res.status(404).send({ message: "User not found" })
      }
      res.status(200).send(user)
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersAdminRouter.get(
  "/:id/transactions",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserIdAdminRequest> =
      userIdAdminValidator.validate({ ...req.params, ...req.query })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const limit: number = validation.value.limit ?? 10
      const page: number = validation.value.page ?? 0
      const user: UserWithTransactions | null = await prisma.user.findUnique({
        where: { id: validation.value.id },
        include: {
          transactions: {
            take: limit,
            skip: page * limit,
          },
        },
      })
      if (user === null) {
        return res.status(404).send({ message: "User not found" })
      }
      res.status(200).send(user.transactions)
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserAdminUpdateRequest> =
      userAdminUpdateValidator.validate({ ...req.params, ...req.body })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: validation.value.id,
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
          role: validation.value.role,
        },
      })
      res.status(200).send({ message: "User updated", data: updatedUser })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserIdAdminRequest> =
      userIdAdminValidator.validate(req.params)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const user: User | null = await prisma.user.findUnique({
        where: {
          id: Number(req.params.id),
        },
      })
      if (user === null) {
        return res.status(404).send({ message: "User not found" })
      }
      const deletedUser: User = await prisma.user.delete({
        where: { id: user.id },
      })
      res.status(200).send({ message: "User deleted", user: deletedUser })
    } catch (error) {
      await handleError(error, res)
    }
  }
)
