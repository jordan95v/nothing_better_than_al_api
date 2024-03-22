import express, { Express } from "express"
import { Handler } from "./handlers/handler"
import { HealthHandler } from "./handlers/health-handler"

class App {
  private app: Express
  private port: number
  private handlers: Handler[] = []

  constructor(port: number = 3000) {
    this.app = express()
    this.app.use(express.json())
    this.port = port
  }

  public getApp(): Express {
    return this.app
  }

  public addHandler(handler: Handler) {
    this.handlers.push(handler)
  }

  public start() {
    this.handlers.forEach((handler) => handler.setup())
    this.app.listen(this.port, () => {
      console.log(`Server started at http://localhost:${this.port}`)
    })
  }
}

const app: App = new App()
const api: Express = app.getApp()
app.addHandler(new HealthHandler(api))
app.start()
