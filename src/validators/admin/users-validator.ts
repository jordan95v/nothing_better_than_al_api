import { Role } from "@prisma/client"
import Joi, { extend } from "joi"

export interface UserIdAdminRequest {
  id: number
}

export const userIdAdminValidator = Joi.object<UserIdAdminRequest>({
  id: Joi.number().required(),
})

export interface UserAdminUpdateRequest extends UserIdAdminRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: Role
}

export const userAdminUpdateValidator = Joi.object<UserAdminUpdateRequest>({
  id: Joi.number().required(),
  email: Joi.string().email().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  role: Joi.string()
    .valid(...Object.values(Role))
    .optional(),
})
