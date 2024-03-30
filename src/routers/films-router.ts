import { Router, Request, Response } from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { prisma } from ".."
import { Film } from "@prisma/client"
import {
  FilmGetRequest,
  FilmIdGetRequest,
  filmGetValidator,
  filmIdGetValidator,
} from "../validators/films-validator"
import Joi from "joi"
import { generateValidationErrorMessage } from "../errors/generate-validation-message"

export const filmsRouter = Router()

filmsRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<FilmGetRequest> =
    filmGetValidator.validate(req.query)
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const films: Film[] | null = await prisma.film.findMany({
      where: {
        title: {
          contains: validation.value.title,
          mode: "insensitive",
        },
        type: validation.value.type,
        duration: {
          gte: validation.value.minDuration,
          lte: validation.value.maxDuration,
        },
        sessions: {
          some: {
            startAt: {
              gte: validation.value.startDate,
              lte: validation.value.endDate,
            },
          },
        },
      },
      include: { sessions: true },
    })
    res.status(200).send(films)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})

filmsRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const validation: Joi.ValidationResult<FilmIdGetRequest> =
    filmIdGetValidator.validate({ ...req.params, ...req.query })
  if (validation.error) {
    return res.status(400).send({
      errors: generateValidationErrorMessage(validation.error.details),
    })
  }
  try {
    const film: Film | null = await prisma.film.findUnique({
      where: {
        id: validation.value.id,
        sessions: {
          some: {
            startAt: {
              gte: validation.value.startDate,
              lte: validation.value.endDate,
            },
          },
        },
      },
      include: { sessions: true },
    })
    if (film === null) {
      return res.status(404).send({ message: "Film not found" })
    }
    res.status(200).send(film)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  }
})
