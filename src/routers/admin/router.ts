import { Router } from "express"
import { filmsAdminRouter } from "./films-router"
import { roomsAdminRouter } from "./rooms-router"
import { sessionsAdminRouter } from "./sessions-router"
import { usersAdminRouter } from "./users-router"

export const adminRouter: Router = Router()

adminRouter.use("/users", usersAdminRouter)
adminRouter.use("/rooms", roomsAdminRouter)
adminRouter.use("/films", filmsAdminRouter)
adminRouter.use("/sessions", sessionsAdminRouter)
