import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { Role, Token, User } from "@prisma/client"
import { prisma } from ".."

interface TokenWithUser extends Token {
  user: User
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ message: "Authorization header is required" })
  }
  const token: string = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).send({ message: "Token is required" })
  }
  const dbToken: TokenWithUser | null = await prisma.token.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  })
  if (!dbToken) {
    return res.status(401).send({ message: "Invalid token" })
  }
  const secret: string = process.env.JWT_SECRET ?? "secret"
  verify(token, secret, (error, user) => {
    if (error) {
      return res.status(401).send({ message: "Invalid token" })
    }
    req.user = dbToken.user
    next()
  })
}

export const authMiddlewareAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== Role.ADMIN) {
    return res
      .status(403)
      .send({ message: "You are not allowed to access this resource" })
  }
  next()
}
