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
  const token: string = authHeader?.split(" ")[1] ?? ""
  if (!authHeader || !token) {
    return res.status(401).send({ message: "Bearer token not provided" })
  }
  const dbToken: TokenWithUser | null = await prisma.token.findUnique({
    where: { token },
    include: { user: true },
  })
  if (dbToken === null) {
    return res.status(401).send({ message: "Invalid token" })
  }
  verify(token, process.env.JWT_SECRET ?? "secret", (error) => {
    if (error) {
      return res.status(401).send({ message: "Invalid is not valid" })
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
    return res.status(403).send({ message: "Unauthorized" })
  }
  next()
}
