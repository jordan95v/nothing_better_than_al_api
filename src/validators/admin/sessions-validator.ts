import Joi from "joi"

export const MAINTENANCE_TIME: number = 30
export const MIN_SESSION_START_AT: number = 9
export const MAX_SESSION_START_AT: number = 20

export interface SessionCreateRequest {
  startAt: Date
  filmId: number
  roomId: number
}

export const sessionCreateValidator = Joi.object<SessionCreateRequest>({
  startAt: Joi.date().required().iso(),
  filmId: Joi.number().required(),
  roomId: Joi.number().required(),
}).options({ abortEarly: false })

export interface SessionIdAdminRequest {
  id: number
}

export const sessionIdAdminValidator = Joi.object<SessionIdAdminRequest>({
  id: Joi.number().required(),
}).options({ abortEarly: false })

export interface SessionUpdateRequest extends SessionIdAdminRequest {
  startAt?: Date
  filmId?: number
  roomId?: number
}

export const sessionUpdateValidator = Joi.object<SessionUpdateRequest>({
  id: Joi.number().required(),
  startAt: Joi.date().optional().iso(),
  filmId: Joi.number().optional(),
  roomId: Joi.number().optional(),
}).options({ abortEarly: false })
