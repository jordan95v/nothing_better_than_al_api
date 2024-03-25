import express, { Express } from "express"
import { healthRouter } from "./routers/health-router"
import { usersRouter } from "./routers/users-router"
import { adminUsersRouter } from "./routers/admin/users-router"
import { PrismaClient, User } from "@prisma/client"
import { roomsRouter } from "./routers/rooms-router"
import { roomsAdminRouter } from "./routers/admin/rooms-router"

export const prisma: PrismaClient = new PrismaClient()

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
    interface Response {
      user?: User
    }
  }
}

/**
 * Starts the server on the specified port.
 * @param port - The port number to listen on. Defaults to 3000 if not provided.
 */
async function main(port: number = 3000): Promise<void> {
  const app: Express = express()
  app.use(express.json())

  app.use("/healthcheck", healthRouter)
  app.use("/users", usersRouter)
  app.use("/admin/users", adminUsersRouter)
  app.use("/admin/rooms", roomsAdminRouter)
  app.use("/rooms", roomsRouter)

  app.listen(port, () => {
    console.log("Server started at http://localhost:3000")
  })
}

main()
