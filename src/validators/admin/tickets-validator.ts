import Joi from "joi"

export interface TicketAdminGetRequest {
  limit: number
  page: number
}

export const ticketAdminGetValidator: Joi.ObjectSchema<TicketAdminGetRequest> =
  Joi.object<TicketAdminGetRequest>({
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  }).options({ abortEarly: false })

export interface TicketAdminSetUsedRequest {
  id: number
  sessionId: number
  used: boolean
}

export const ticketAdminSetUsedValidator: Joi.ObjectSchema<TicketAdminSetUsedRequest> =
  Joi.object<TicketAdminSetUsedRequest>({
    id: Joi.number().required(),
    sessionId: Joi.number().optional(),
    used: Joi.boolean().optional(),
  }).options({ abortEarly: false })
