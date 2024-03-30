import express, { Express } from "express"
import { PrismaClient, User } from "@prisma/client"
import { router } from "./routers/router"
import { invalidPathHandler } from "./errors/invalid-path-handler"

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
  app.use(invalidPathHandler)

  const host: string = process.env.HOST || "localhost"
  app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`)
  })
}

main()
