import { Request, Response } from "express"
import { Handler } from "./handler"

export class HealthHandler extends Handler {
  public setup(): void {
    this.app.get("/health", async (req: Request, res: Response) => {
      res.status(200).send({ message: "Server is running" })
    })
  }
}
