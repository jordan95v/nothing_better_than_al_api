import { Router, Request, Response } from "express"
import { handleError } from "../errors/handle-error"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"
import Joi from "joi"
import {
  StatisticsRequest,
  statisticsValidator,
} from "../validators/statistics-validator"
import { prisma } from ".."
import { Session } from "@prisma/client"
import { DEFAULT_CONFIG } from "../config"

export const statisticsRouter = Router()

interface SessionTicketCount {
  session: Session
  usedTickets: number
  ticketSales: number
}

statisticsRouter.get("/", async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<StatisticsRequest> =
    statisticsValidator.validate(req.query)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const limit: number = validation.value.limit ?? DEFAULT_CONFIG.LIMIT
    const page: number = validation.value.page ?? DEFAULT_CONFIG.PAGE
    const sessionTicketCounts: SessionTicketCount[] = []
    const sessions = await prisma.session.findMany({
      where: {
        startAt: {
          gte: validation.value.startAt,
          lte: validation.value.endAt,
        },
      },
      take: limit,
      skip: page * limit,
    })
    for (const session of sessions) {
      const usedTickets = await prisma.ticket.count({
        where: { sessionId: session.id, used: true },
      })
      const ticketSales = await prisma.ticket.count({
        where: { sessionId: session.id },
      })
      sessionTicketCounts.push({ session, usedTickets, ticketSales })
    }
    res.status(200).send({ sessionTicketCounts })
  } catch (error) {
    await handleError(error, res)
  }
})
