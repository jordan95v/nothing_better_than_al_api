import { Router, Request, Response } from "express"
import {
  userSignupValidator,
  userLoginValidator,
  UserSignupRequest,
  UserLoginRequest,
  userUpdateValidator,
  UserUpdateRequest,
  userOperationValidator,
  UserOperationRequest,
  UserTransactionRequest,
  userTransactionValidator,
} from "../validators/users-validator"
import { compare, hash } from "bcrypt"
import { sign } from "jsonwebtoken"
import { prisma } from ".."
import Joi from "joi"
import { Transaction, TransactionType, User } from "@prisma/client"
import { authMiddleware } from "../middlewares/auth-middleware"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"
import { handleError } from "../errors/handle-error"
import { DEFAULT_CONFIG } from "../config"

export const usersRouter = Router()

usersRouter.post("/signup", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<UserSignupRequest> =
    userSignupValidator.validate(req.body)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const hashedPassword: string = await hash(req.body.password, 10)
    const user: User = await prisma.user.create({
      data: {
        firstName: validation.value.firstName,
        lastName: validation.value.lastName,
        email: validation.value.email,
        password: hashedPassword,
      },
    })
    res.status(201).send({ message: "User created", user })
  } catch (error) {
    await handleError(error, res)
  }
})

usersRouter.post("/login", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<UserLoginRequest> =
    userLoginValidator.validate(req.body)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const user: User | null = await prisma.user.findUnique({
      where: { email: validation.value.email },
    })
    if (user === null) {
      return res.status(401).send({ message: "Invalid email or password" })
    }
    const passwordMatch: boolean = await compare(
      validation.value.password,
      user.password
    )
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid email or password" })
    }
    const secret: string = process.env.JWT_SECRET ?? "secret"
    const token: string = sign({ userId: user, email: user }, secret, {
      expiresIn: "1d",
    })
    await prisma.token.create({
      data: { token, userId: user.id },
    })
    res.status(200).send({ message: "Logged in", token: token })
  } catch (error) {
    await handleError(error, res)
  }
})

usersRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user: User | null = await prisma.user.findUnique({
      where: { id: req.user.id },
    })
    res.status(200).send({ user: user })
  } catch (error) {
    await handleError(error, res)
  }
})

usersRouter.get(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      await prisma.token.deleteMany({
        where: { userId: req.user.id },
      })
      res.status(200).send({ message: "Logged out" })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersRouter.patch("/", authMiddleware, async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<UserUpdateRequest> =
    userUpdateValidator.validate(req.body)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  if (validation.value.password) {
    validation.value.password = await hash(validation.value.password, 10)
  }
  try {
    const updatedUser: User = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...validation.value },
    })
    res.status(200).send({ message: "User updated", user: updatedUser })
  } catch (error) {
    await handleError(error, res)
  }
})

usersRouter.delete("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const deletedUser: User = await prisma.user.delete({
      where: { id: req.user.id },
    })
    res.status(200).send({ message: "User deleted", user: deletedUser })
  } catch (error) {
    await handleError(error, res)
  }
})

usersRouter.post(
  "/deposit",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserOperationRequest> =
      userOperationValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const updatedUser: User = await prisma.user.update({
        where: { id: req.user.id },
        data: { money: { increment: validation.value.amount } },
      })
      const transaction: Transaction = await prisma.transaction.create({
        data: {
          amount: validation.value.amount,
          userId: req.user.id,
          type: TransactionType.DEPOSIT,
        },
      })
      res
        .status(200)
        .send({ message: "Deposit successful", user: updatedUser, transaction })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersRouter.post(
  "/withdraw",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserOperationRequest> =
      userOperationValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      if (req.user.money < validation.value.amount) {
        return res.status(400).send({ message: "Insufficient funds" })
      }
      const updatedUser: User = await prisma.user.update({
        where: { id: req.user.id },
        data: { money: { decrement: validation.value.amount } },
      })
      const transaction: Transaction = await prisma.transaction.create({
        data: {
          amount: validation.value.amount,
          userId: req.user.id,
          type: TransactionType.WITHDRAW,
        },
      })
      res.status(200).send({
        message: "Withdrawal successful",
        user: updatedUser,
        transaction,
      })
    } catch (error) {
      await handleError(error, res)
    }
  }
)

usersRouter.get(
  "/transactions",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<UserTransactionRequest> =
      userTransactionValidator.validate(req.query)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const limit: number = validation.value.limit ?? DEFAULT_CONFIG.LIMIT
      const page: number = validation.value.page ?? DEFAULT_CONFIG.PAGE
      const transactions: Transaction[] = await prisma.transaction.findMany({
        where: { userId: req.user.id },
        include: { ticket: true },
        take: limit,
        skip: page * limit,
      })
      res.status(200).send({
        numberOfTransactions: transactions.length,
        transactions: transactions,
      })
    } catch (error) {
      await handleError(error, res)
    }
  }
)
