import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Room } from "@prisma/client"

export const roomsRouter = Router()

roomsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms: Room[] | null = await prisma.room.findMany()
    res.status(200).send(rooms)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

roomsRouter.get(
  "/:number",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const room: Room | null = await prisma.room.findUnique({
        where: {
          number: parseInt(req.params.number),
        },
      })
      res.status(200).send(room)
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" })
    }
  }
)
