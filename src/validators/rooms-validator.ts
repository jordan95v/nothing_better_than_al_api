import Joi from "joi"

export interface RoomGetRequest {
  startDate: Date
  endDate: Date
}

export const roomGetValidator = Joi.object<RoomGetRequest>({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
}).options({ abortEarly: false })
