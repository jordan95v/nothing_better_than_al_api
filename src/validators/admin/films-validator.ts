import { FilmType } from "@prisma/client"
import Joi from "joi"

export interface FilmCreateRequest {
  title: string
  type: FilmType
  description: string
  duration: number
  image: string
}

export const filmCreateValidator = Joi.object<FilmCreateRequest>({
  title: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(FilmType))
    .required(),
  description: Joi.string().required(),
  duration: Joi.number().required(),
  image: Joi.string().required(),
}).options({ abortEarly: false })

export interface FilmUpdateRequest {
  title?: string
  type?: FilmType
  description?: string
  duration?: number
  image?: string
}

export const filmUpdateValidator = Joi.object<FilmUpdateRequest>({
  title: Joi.string().optional(),
  type: Joi.string()
    .valid(...Object.values(FilmType))
    .optional(),
  description: Joi.string().optional(),
  duration: Joi.number().optional(),
  image: Joi.string().optional(),
}).options({ abortEarly: false })
