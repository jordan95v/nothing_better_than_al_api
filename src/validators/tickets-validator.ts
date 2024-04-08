import Joi from "joi"

export interface TicketBuyRequest {
  sessionId: number
}

export const ticketBuyValidator: Joi.ObjectSchema<TicketBuyRequest> =
  Joi.object<TicketBuyRequest>({
    sessionId: Joi.number().required(),
  }).options({ abortEarly: false })
