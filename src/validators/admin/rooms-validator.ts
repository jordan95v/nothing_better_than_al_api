import { RoomType } from "@prisma/client"
import Joi from "joi"

export const roomBasePrice = {
  [RoomType.STANDARD]: 10,
  [RoomType.IMAX]: 16,
}

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
  capacity: Joi.number().required().min(15).max(30),
  handicap: Joi.boolean().required(),
  maintenance: Joi.boolean().required(),
}).options({ abortEarly: false })

export interface RoomUpdateRequest {
  name?: string
  number?: number
  description?: string
  images?: string[]
  type?: RoomType
  capacity?: number
  handicap?: boolean
  maintenance?: boolean
}

export const roomUpdateValidator = Joi.object<RoomUpdateRequest>({
  name: Joi.string().optional(),
  number: Joi.number().optional(),
  description: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  type: Joi.string()
    .valid(...Object.values(RoomType))
    .optional(),
  capacity: Joi.number().optional().min(15).max(30),
  handicap: Joi.boolean().optional(),
  maintenance: Joi.boolean().optional(),
}).options({ abortEarly: false })
