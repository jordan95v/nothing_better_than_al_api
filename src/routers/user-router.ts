import { Router, Request, Response } from "express"
import {
  userSignupValidator,
  userLoginValidator,
  UserSignupRequest,
  UserLoginRequest,
} from "../validators/user-validator"
import { compare, hash } from "bcrypt"
import { sign } from "jsonwebtoken"
import { prisma } from ".."
import Joi from "joi"
import { User } from "@prisma/client"
import {
  authMiddleware,
  authMiddlewawreAdmin,
} from "../middlewares/auth-middleware"

export const userRouter = Router()

userRouter.post("/signup", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<UserSignupRequest> =
    userSignupValidator.validate(req.body)
  if (validation.error) {
    return res.status(400).send({ message: validation.error.message })
  }
  const hashedPassword: string = await hash(req.body.password, 10)
  try {
    const user = await prisma.user.create({
      data: {
        firstName: validation.value.firstName,
        lastName: validation.value.lastName,
        email: validation.value.email,
        password: hashedPassword,
      },
    })
    res.send({ message: "User created", data: user })
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

userRouter.post("/login", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<UserLoginRequest> =
    userLoginValidator.validate(req.body)
  if (validation.error) {
    return res.status(400).send({ message: validation.error.message })
  }
  try {
    const user: User | null = await prisma.user.findUnique({
      where: {
        email: validation.value.email,
      },
    })
    if (!user) {
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
      data: {
        token,
        userId: user.id,
      },
    })
    res.send({ message: "Logged in", token: token })
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

userRouter.get(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      await prisma.token.deleteMany({
        where: {
          userId: req.user?.id,
        },
      })
      res.send({ message: "Logged out" })
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)

userRouter.get(
  "/",
  authMiddleware,
  authMiddlewawreAdmin,
  async (req: Request, res: Response) => {
    const users: User[] = await prisma.user.findMany()
    res.send({ users: users })
  }
)
