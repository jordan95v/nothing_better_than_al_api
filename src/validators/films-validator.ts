import { FilmType } from "@prisma/client"
import Joi from "joi"

export interface FilmGetRequest {
  title?: string
  type?: FilmType
  minDuration?: number
  maxDuration?: number
  startDate?: string
  endDate?: string
  limit?: number
  page?: number
}

export const filmGetValidator = Joi.object<FilmGetRequest>({
  title: Joi.string().optional(),
  type: Joi.string()
    .valid(...Object.values(FilmType))
    .optional(),
  minDuration: Joi.number().optional(),
  maxDuration: Joi.number().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
}).options({ abortEarly: false })

export interface FilmIdGetRequest {
  id: number
  startDate?: string
  endDate?: string
}

export const filmIdGetValidator = Joi.object<FilmIdGetRequest>({
  id: Joi.number().required(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
}).options({ abortEarly: false })
