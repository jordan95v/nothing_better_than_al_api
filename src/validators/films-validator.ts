import { FilmType } from "@prisma/client"
import Joi from "joi"

export interface FilmGetRequest {
  title?: string
  type?: FilmType
  minDuration?: number
  maxDuration?: number
}

export const filmGetValidator = Joi.object<FilmGetRequest>({
  title: Joi.string().optional(),
  type: Joi.string()
    .valid(...Object.values(FilmType))
    .optional(),
  minDuration: Joi.number().optional(),
  maxDuration: Joi.number().optional(),
}).options({ abortEarly: false })
