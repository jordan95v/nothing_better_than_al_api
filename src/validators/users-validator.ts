import { Role } from "@prisma/client"
import Joi from "joi"

export interface UserSignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const userSignupValidator = Joi.object<UserSignupRequest>({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

export interface UserLoginRequest {
  email: string
  password: string
}

export const userLoginValidator = Joi.object<UserLoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

export interface UserUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
}

export const userUpdateValidator = Joi.object<UserUpdateRequest>({
  email: Joi.string().email().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
})
