import express, { Express } from "express"
import { PrismaClient, User } from "@prisma/client"
import { router } from "./routers/router"

export const prisma: PrismaClient = new PrismaClient()

declare global {
  namespace Express {
    interface Request {
      user: User
    }
    interface Response {
      user: User
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: User
}

/**
 * Starts the server on the specified port.
 * @param port - The port number to listen on. Defaults to 3000 if not provided.
 */
async function main(port: number = 3000): Promise<void> {
  const app: Express = express()
  app.use(express.json())

  app.use("/", router)

  app.listen(port, () => {
    console.log("Server started at http://localhost:3000")
  })
}

main()
