import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { Role } from "@prisma/client"
import { prisma } from ".."
import { TokenWithUser } from "../models"

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
      return res.status(401).send({ message: "Token is not valid / expired." })
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
