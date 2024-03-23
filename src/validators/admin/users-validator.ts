import { Role } from "@prisma/client"
import Joi from "joi"

export interface UserAdminUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

export const userAdminUpdateValidator = Joi.object<UserAdminUpdateRequest>({
  email: Joi.string().email().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  role: Joi.string().valid(Role.ADMIN, Role.USER).optional(),
})
