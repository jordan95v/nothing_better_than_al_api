import Joi from "joi"

export interface UserSignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const userSignupValidator: Joi.ObjectSchema<UserSignupRequest> =
  Joi.object<UserSignupRequest>({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).options({ abortEarly: false })

export interface UserLoginRequest {
  email: string
  password: string
}

export const userLoginValidator: Joi.ObjectSchema<UserLoginRequest> =
  Joi.object<UserLoginRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).options({ abortEarly: false })

export interface UserUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
}

export const userUpdateValidator: Joi.ObjectSchema<UserUpdateRequest> =
  Joi.object<UserUpdateRequest>({
    email: Joi.string().email().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    password: Joi.string().min(8).optional(),
  }).options({ abortEarly: false })

export interface UserOperationRequest {
  amount: number
}

export const userOperationValidator: Joi.ObjectSchema<UserOperationRequest> =
  Joi.object<UserOperationRequest>({
    amount: Joi.number().required().min(1),
  }).options({ abortEarly: false })

export interface UserTransactionRequest {
  limit?: number
  page?: number
}

export const userTransactionValidator: Joi.ObjectSchema<UserTransactionRequest> =
  Joi.object<UserTransactionRequest>({
    limit: Joi.number().optional().min(1),
    page: Joi.number().optional().min(0),
  }).options({ abortEarly: false })
