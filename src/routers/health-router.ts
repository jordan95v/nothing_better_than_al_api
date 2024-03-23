import { Router, Request, Response } from "express"

export const healthRouter = Router()

healthRouter.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ message: "Server is running" })
})
