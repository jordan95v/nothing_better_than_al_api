import express, { Express, Router } from "express"
import { healthRouter } from "./routers/health-router"

/**
 * Starts the server on the specified port.
 * @param port - The port number to listen on. Defaults to 3000 if not provided.
 */
async function main(port: number = 3000) {
  const app: Express = express()
  app.use(express.json())
  app.use("/healthcheck", healthRouter)
  app.listen(port, () => {
    console.log("Server started at http://localhost:3000")
  })
}

main()
