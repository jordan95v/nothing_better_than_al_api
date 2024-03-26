import Joi from "joi"

export const MAINTENANCE_TIME: number = 30
export const MIN_SESSION_START_AT: number = 9
export const MAX_SESSION_START_AT: number = 20

export interface SessionCreateRequest {
  startAt: Date
  filmId: number
  roomId: number
  basePrice: number
}

export const sessionCreateValidator = Joi.object<SessionCreateRequest>({
  startAt: Joi.date().required().iso(),
  filmId: Joi.number().required(),
  roomId: Joi.number().required(),
  basePrice: Joi.number().required(),
}).options({ abortEarly: false })
