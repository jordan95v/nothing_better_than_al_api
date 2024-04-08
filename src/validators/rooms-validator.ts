import Joi from "joi"

export interface RoomGetRequest {
  limit?: number
  page?: number
}

export const roomGetValidator: Joi.ObjectSchema<RoomGetRequest> =
  Joi.object<RoomGetRequest>({
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  }).options({ abortEarly: false })

export interface RoomIdGetRequest {
  number: number
  startDate?: Date
  endDate?: Date
}

export const roomIdGetValidator: Joi.ObjectSchema<RoomIdGetRequest> =
  Joi.object<RoomIdGetRequest>({
    number: Joi.number().required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
  }).options({ abortEarly: false })

export interface RoomIdSatisticsRequest {
  number: number
  startAt?: Date
  endAt?: Date
  limit?: number
  page?: number
}

export const roomIdGetStatisticsValidator: Joi.ObjectSchema<RoomIdSatisticsRequest> =
  Joi.object<RoomIdSatisticsRequest>({
    number: Joi.number().required(),
    startAt: Joi.date().iso().optional(),
    endAt: Joi.date().iso().optional(),
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  }).options({ abortEarly: false })
