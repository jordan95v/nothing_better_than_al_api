import { Router, Request, Response } from "express"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import { generateValidationErrorMessage } from "../../errors/generate-validation-message"
import { prisma } from "../.."
import Joi from "joi"
import { Ticket } from "@prisma/client"
import { handleError } from "../../errors/handle-error"
import {
  TicketAdminGetRequest,
  TicketAdminSetUsedRequest,
  ticketAdminGetValidator,
  ticketAdminSetUsedValidator,
} from "../../validators/admin/tickets-validator"
import { DEFAULT_CONFIG } from "../../config"

export const ticketsAdminRouter = Router()

ticketsAdminRouter.get(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<TicketAdminGetRequest> =
      ticketAdminGetValidator.validate(req.query)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const limit: number = validation.value.limit ?? DEFAULT_CONFIG.LIMIT
      const page: number = validation.value.page ?? DEFAULT_CONFIG.PAGE
      const tickets: Ticket[] = await prisma.ticket.findMany({
        take: limit,
        skip: page * limit,
        include: { user: true, session: true },
      })
      return res.status(200).send(tickets)
    } catch (error) {
      await handleError(error, res)
    }
  }
)

ticketsAdminRouter.post(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<TicketAdminSetUsedRequest> =
      ticketAdminSetUsedValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const ticket: Ticket = await prisma.ticket.update({
        where: { id: validation.value.id },
        data: {
          used: validation.value.used,
          sessionId: validation.value.sessionId,
        },
      })
      return res.status(200).send({ message: "Ticket updated", data: ticket })
    } catch (error) {
      await handleError(error, res)
    }
  }
)
