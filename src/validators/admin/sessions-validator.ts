import Joi from "joi"

export interface SessionCreateRequest {
  startAt: Date
  filmId: number
  roomId: number
}

export const sessionCreateValidator: Joi.ObjectSchema<SessionCreateRequest> =
  Joi.object<SessionCreateRequest>({
    startAt: Joi.date().required().iso(),
    filmId: Joi.number().required(),
    roomId: Joi.number().required(),
  }).options({ abortEarly: false })

export interface SessionIdAdminRequest {
  id: number
}

export const sessionIdAdminValidator: Joi.ObjectSchema<SessionIdAdminRequest> =
  Joi.object<SessionIdAdminRequest>({
    id: Joi.number().required(),
  }).options({ abortEarly: false })

export interface SessionUpdateRequest extends SessionIdAdminRequest {
  startAt?: Date
  filmId?: number
  roomId?: number
}

export const sessionUpdateValidator: Joi.ObjectSchema<SessionUpdateRequest> =
  Joi.object<SessionUpdateRequest>({
    id: Joi.number().required(),
    startAt: Joi.date().optional().iso(),
    filmId: Joi.number().optional(),
    roomId: Joi.number().optional(),
  }).options({ abortEarly: false })
