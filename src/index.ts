import express, { Express } from "express"
import { PrismaClient } from "@prisma/client"
import { router } from "./routers/router"
import { invalidPathHandler } from "./errors/invalid-path-handler"
import { readFileSync } from "fs"
import { parse } from "yaml"
import { adminAuth } from "./auth"

export const prisma: PrismaClient = new PrismaClient()

async function main(): Promise<void> {
  const app: Express = express()
  const swagger = require("swagger-ui-express")
  const swaggerDocument = parse(readFileSync("./src/swagger.yml", "utf8"))
  const swaggerAdminDocument = parse(
    readFileSync("./src/admin-swagger.yml", "utf8")
  )
  const basicAuth = require("express-basic-auth")

  app.use(
    "/api-docs",
    swagger.serveFiles(swaggerDocument),
    swagger.setup(swaggerDocument)
  )
  app.use(
    "/admin-docs",
    basicAuth({
      authorizer: adminAuth,
      challenge: true,
      authorizeAsync: true,
    }),
    swagger.serveFiles(swaggerAdminDocument),
    swagger.setup(swaggerAdminDocument)
  )

  app.use(express.json())
  app.use("/", router)
  app.use(invalidPathHandler)

  const host: string = process.env.API_HOST || "localhost"
  const port = parseInt(process.env.API_PORT || "3000")

  app.listen(port, host, () => {
    console.log(`Server started at http://${host}:${port}`)
  })
}

main()
