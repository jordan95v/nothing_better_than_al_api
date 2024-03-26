import { Router, Request, Response } from "express"
import {
  authMiddleware,
  authMiddlewareAdmin,
} from "../../middlewares/auth-middleware"
import { generateValidationErrorMessage } from "../../validators/generate-validation-message"
import { prisma } from "../.."
import Joi from "joi"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {
  HttpError,
  generatePrismaErrorMessage,
} from "../../validators/generate-error-message"
import { Session, Film } from "@prisma/client"
import {
  MAINTENANCE_TIME,
  MAX_SESSION_START_AT,
  MIN_SESSION_START_AT,
  SessionCreateRequest,
  sessionCreateValidator,
} from "../../validators/admin/sessions-validator"

export const sessionsAdminRouter = Router()

interface SessionWithFilm extends Session {
  film: Film
}

class SessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SessionError"
    this.message = message
  }
}

const checkHours = (date: Date): boolean => {
  const hour = date.getHours()
  return hour >= MIN_SESSION_START_AT && hour <= MAX_SESSION_START_AT
}

const checkSessionOverlap = async (
  request: SessionCreateRequest,
  film: Film
): Promise<boolean> => {
  const foundSession = await prisma.session.findMany({
    where: { roomId: request.roomId },
    include: { film: true },
  })
  const newSessionStart = new Date(request.startAt)
  const newSessionEnd = new Date(request.startAt)
  newSessionEnd.setMinutes(
    newSessionEnd.getMinutes() + film.duration + MAINTENANCE_TIME
  )
  for (const session of foundSession) {
    const sessionStart = new Date(session.startAt)
    const sessionEnd = new Date(session.startAt)
    sessionEnd.setMinutes(sessionEnd.getMinutes() + session.film.duration)
    if (
      (newSessionStart >= sessionStart && newSessionStart < sessionEnd) ||
      (newSessionEnd > sessionStart && newSessionEnd <= sessionEnd) ||
      (newSessionStart <= sessionStart && newSessionEnd >= sessionEnd)
    ) {
      return true
    }
  }
  return false
}

const checks = async (request: SessionCreateRequest): Promise<void> => {
  request.startAt.setHours(request.startAt.getHours() + 1)
  const foundFilm: Film | null = await prisma.film.findUnique({
    where: { id: request.filmId },
  })
  if (foundFilm === null) {
    throw new SessionError("Film not found")
  }
  const foundRoom = await prisma.room.findUnique({
    where: { id: request.roomId },
  })
  if (foundRoom === null) {
    throw new SessionError("Room not found")
  }
  if (checkHours(request.startAt) === false) {
    throw new SessionError("Invalid hour")
  }
  if (await checkSessionOverlap(request, foundFilm)) {
    throw new SessionError("Session is overlaping.")
  }
}

sessionsAdminRouter.post(
  "/",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<SessionCreateRequest> =
      sessionCreateValidator.validate(req.body)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      await checks(validation.value)
      const session: Session = await prisma.session.create({
        data: validation.value,
      })
      res.status(201).send(session)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      if (error instanceof SessionError) {
        return res.status(400).send({ message: error.message })
      }
      res.status(500).send({ message: "Something went wrong." })
    }
  }
)
