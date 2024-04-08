import Joi from "joi"

export interface StatisticsRequest {
  startAt?: string
  endAt?: string
  limit?: number
  page?: number
}

export const statisticsValidator: Joi.ObjectSchema<StatisticsRequest> =
  Joi.object<StatisticsRequest>({
    startAt: Joi.string().isoDate().optional(),
    endAt: Joi.string().isoDate().optional(),
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  }).options({ abortEarly: false })
