import Joi from "joi"

export interface RoomGetRequest {
  limit?: number
  page?: number
}

export const roomGetValidator = Joi.object<RoomGetRequest>({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
}).options({ abortEarly: false })

export interface RoomIdGetRequest {
  number: number
  startDate?: Date
  endDate?: Date
}

export const roomIdGetValidator = Joi.object<RoomIdGetRequest>({
  number: Joi.number().required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
}).options({ abortEarly: false })
