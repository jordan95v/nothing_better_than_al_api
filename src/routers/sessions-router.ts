import { Router, Request, Response } from "express"
import { prisma } from ".."

export const sessionsRouter = Router()

sessionsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      include: { film: true, room: true },
    })
    res.status(200).send(sessions)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})
