import Joi from "joi"

export interface SessionGetRequest {
  startAt?: Date
  endAt?: Date
}

export const sessionGetValidator = Joi.object<SessionGetRequest>({
  startAt: Joi.date().iso().optional(),
  endAt: Joi.date().iso().optional(),
})

export interface SessionIdGetRequest {
  id: number
}

export const sessionIdGetValidator = Joi.object<SessionIdGetRequest>({
  id: Joi.number().required(),
})
