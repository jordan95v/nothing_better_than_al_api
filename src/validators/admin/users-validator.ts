import { Role } from "@prisma/client"
import Joi from "joi"

export interface UserAdminUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: Role
}

export const userAdminUpdateValidator = Joi.object<UserAdminUpdateRequest>({
  email: Joi.string().email().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  role: Joi.string()
    .valid(...Object.values(Role))
    .optional(),
})
