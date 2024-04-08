import Joi from "joi"

export interface SessionGetRequest {
  startAt?: Date
  endAt?: Date
  limit?: number
  page?: number
}

export const sessionGetValidator: Joi.ObjectSchema<SessionGetRequest> =
  Joi.object<SessionGetRequest>({
    startAt: Joi.date().iso().optional(),
    endAt: Joi.date().iso().optional(),
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  })

export interface SessionIdGetRequest {
  id: number
}

export const sessionIdGetValidator: Joi.ObjectSchema<SessionIdGetRequest> =
  Joi.object<SessionIdGetRequest>({
    id: Joi.number().required(),
  })
