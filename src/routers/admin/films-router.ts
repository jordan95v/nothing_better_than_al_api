import { Router, Request, Response } from "express"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import { generateValidationErrorMessage } from "../../errors/generate-validation-message"
import { prisma } from "../.."
import Joi from "joi"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../../errors/generate-error-message"
import { Film } from "@prisma/client"
import {
  FilmCreateRequest,
  filmCreateValidator,
  FilmIdAdminRequest,
  filmIdAdminValidator,
  FilmUpdateRequest,
  filmUpdateValidator,
} from "../../validators/admin/films-validator"

export const filmsAdminRouter = Router()

filmsAdminRouter.post(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<FilmCreateRequest> =
      filmCreateValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const film: Film = await prisma.film.create({
        data: { ...validation.value },
      })
      return res.status(200).send({ message: "Film created", data: film })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      return res.status(500).send({ message: "Something went wrong" })
    }
  }
)

filmsAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<FilmUpdateRequest> =
      filmUpdateValidator.validate({ ...req.params, ...req.body })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const film: Film = await prisma.film.update({
        where: { id: validation.value.id },
        data: {
          title: validation.value.title,
          type: validation.value.type,
          description: validation.value.description,
          duration: validation.value.duration,
          image: validation.value.image,
        },
      })
      return res.status(200).send({ message: "Film updated", data: film })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      return res.status(500).send({ message: "Something went wrong" })
    }
  }
)

filmsAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<FilmIdAdminRequest> =
      filmIdAdminValidator.validate(req.params)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      await prisma.film.delete({
        where: { id: validation.value.id },
      })
      return res.status(200).send({ message: "Film deleted" })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      return res.status(500).send({ message: "Something went wrong" })
    }
  }
)
