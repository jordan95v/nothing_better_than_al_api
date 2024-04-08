import { RoomType } from "@prisma/client"
import Joi from "joi"
import { RoomCapacity } from "../../config"

export interface RoomCreateRequest {
  name: string
  number: number
  description: string
  images: string[]
  type: RoomType
  capacity: number
  handicap: boolean
  maintenance: boolean
}

export const roomCreateValidator = Joi.object<RoomCreateRequest>({
  name: Joi.string().required(),
  number: Joi.number().required(),
  description: Joi.string().required(),
  images: Joi.array().items(Joi.string()).required(),
  type: Joi.string()
    .valid(...Object.values(RoomType))
    .required(),
  capacity: Joi.number().required().min(RoomCapacity.MIN).max(RoomCapacity.MAX),
  handicap: Joi.boolean().required(),
  maintenance: Joi.boolean().required(),
}).options({ abortEarly: false })

export interface RoomIdAdminRequest {
  id: number
}

export const roomIdAdminValidator: Joi.ObjectSchema<RoomIdAdminRequest> =
  Joi.object<RoomIdAdminRequest>({
    id: Joi.number().required(),
  }).options({ abortEarly: false })

export interface RoomUpdateRequest extends RoomIdAdminRequest {
  name?: string
  number?: number
  description?: string
  images?: string[]
  type?: RoomType
  capacity?: number
  handicap?: boolean
  maintenance?: boolean
}

export const roomUpdateValidator: Joi.ObjectSchema<RoomUpdateRequest> =
  Joi.object<RoomUpdateRequest>({
    id: Joi.number().required(),
    name: Joi.string().optional(),
    number: Joi.number().optional(),
    description: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    type: Joi.string()
      .valid(...Object.values(RoomType))
      .optional(),
    capacity: Joi.number()
      .optional()
      .min(RoomCapacity.MIN)
      .max(RoomCapacity.MAX),
    handicap: Joi.boolean().optional(),
    maintenance: Joi.boolean().optional(),
  }).options({ abortEarly: false })
