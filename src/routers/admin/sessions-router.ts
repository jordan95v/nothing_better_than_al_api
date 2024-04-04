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
import { Session, Film, Room } from "@prisma/client"
import {
  MAINTENANCE_TIME,
  MAX_SESSION_START_AT,
  MIN_SESSION_START_AT,
  SessionCreateRequest,
  SessionIdAdminRequest,
  SessionUpdateRequest,
  sessionCreateValidator,
  sessionIdAdminValidator,
  sessionUpdateValidator,
} from "../../validators/admin/sessions-validator"
import { SessionWithAll } from "../../models"

export const sessionsAdminRouter = Router()

class SessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SessionError"
    this.message = message
  }
}

const checkHours = (date: Date, film: Film): boolean => {
  const startHour: number = date.getHours()
  const endHour: Date = new Date(date)
  endHour.setMinutes(endHour.getMinutes() + film.duration + MAINTENANCE_TIME)
  return (
    !(startHour < MIN_SESSION_START_AT || startHour > MAX_SESSION_START_AT) &&
    !(
      endHour.getHours() < MIN_SESSION_START_AT ||
      endHour.getHours() > MAX_SESSION_START_AT
    )
  )
}

const checkSessionOverlap = async (
  request: SessionCreateRequest,
  film: Film
): Promise<boolean> => {
  if (request.startAt === undefined) {
    return false
  }
  const foundSession: SessionWithAll[] = await prisma.session.findMany({
    where: { roomId: request.roomId },
    include: { film: true, room: true, tickets: true },
  })
  const newSessionStart: Date = new Date(request.startAt)
  const newSessionEnd: Date = new Date(request.startAt)
  newSessionEnd.setMinutes(
    newSessionEnd.getMinutes() + film.duration + MAINTENANCE_TIME
  )
  for (const session of foundSession) {
    const sessionStart: Date = new Date(session.startAt)
    const sessionEnd: Date = new Date(session.startAt)
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
  request.startAt?.setHours(request.startAt?.getHours() + 1)
  const foundFilm: Film | null = await prisma.film.findUnique({
    where: { id: request.filmId },
  })
  if (foundFilm === null) {
    throw new SessionError("Film not found")
  }
  const foundRoom: Room | null = await prisma.room.findUnique({
    where: { id: request.roomId },
  })
  if (foundRoom === null) {
    throw new SessionError("Room not found")
  }
  if (request.startAt !== undefined) {
    if (checkHours(request.startAt, foundFilm) === false) {
      throw new SessionError("Invalid hour")
    }
    if (await checkSessionOverlap(request, foundFilm)) {
      throw new SessionError("Session is overlaping.")
    }
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
      res.status(201).send({ message: "Session created", session: session })
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

sessionsAdminRouter.patch(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<SessionUpdateRequest> =
      sessionUpdateValidator.validate({ ...req.params, ...req.body })
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const session: Session | null = await prisma.session.findUnique({
        where: { id: validation.value.id },
      })
      if (session === null) {
        return res.status(404).send({ message: "Session not found." })
      }
      const updatedSession: SessionCreateRequest = {
        startAt: validation.value.startAt || session.startAt,
        filmId: validation.value.filmId || session.filmId,
        roomId: validation.value.roomId || session.roomId,
      }
      await checks(updatedSession)
      const newSession: Session = await prisma.session.update({
        where: { id: validation.value.id },
        data: updatedSession,
      })
      res.status(200).send({ message: "Session updated", session: newSession })
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

sessionsAdminRouter.delete(
  "/:id",
  authMiddleware,
  authMiddlewareAdmin,
  async (req: Request, res: Response) => {
    const validation: Joi.ValidationResult<SessionIdAdminRequest> =
      sessionIdAdminValidator.validate(req.params)
    if (validation.error) {
      return res.status(400).send({
        errors: generateValidationErrorMessage(validation.error.details),
      })
    }
    try {
      const session: Session | null = await prisma.session.delete({
        where: { id: validation.value.id },
      })
      res.status(200).send({ message: "Session deleted.", session })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const prismaError: HttpError = generatePrismaErrorMessage(error)
        res.status(prismaError.status).send({ message: prismaError.message })
        return
      }
      res.status(500).send({ message: "Something went wrong." })
    }
  }
)
