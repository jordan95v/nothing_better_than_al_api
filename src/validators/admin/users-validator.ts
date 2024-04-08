import { Role } from "@prisma/client"
import Joi, { extend } from "joi"

export interface UserAdminGetRequest {
  limit?: number
  page?: number
}

export const userAdminGetValidator: Joi.ObjectSchema<UserAdminGetRequest> =
  Joi.object<UserAdminGetRequest>({
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  })

export interface UserIdAdminRequest {
  id: number
  limit?: number
  page?: number
}

export const userIdAdminValidator: Joi.ObjectSchema<UserIdAdminRequest> =
  Joi.object<UserIdAdminRequest>({
    id: Joi.number().required(),
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
  })

export interface UserAdminUpdateRequest extends UserIdAdminRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: Role
}

export const userAdminUpdateValidator: Joi.ObjectSchema<UserAdminUpdateRequest> =
  Joi.object<UserAdminUpdateRequest>({
    id: Joi.number().required(),
    email: Joi.string().email().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    role: Joi.string()
      .valid(...Object.values(Role))
      .optional(),
  })
