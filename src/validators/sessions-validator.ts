import Joi from "joi"

export interface SessionGetRequest {
  startAt?: Date
  endAt?: Date
}

export const sessionGetValidator = Joi.object<SessionGetRequest>({
  startAt: Joi.date().iso().optional(),
  endAt: Joi.date().iso().optional(),
})
