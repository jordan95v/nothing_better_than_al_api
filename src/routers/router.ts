import { Router } from "express"
import { healthRouter } from "./health-router"
import { usersRouter } from "./users-router"
import { sessionsRouter } from "./sessions-router"
import { filmsRouter } from "./films-router"
import { roomsRouter } from "./rooms-router"
import { adminRouter } from "./admin/router"
import { statisticsRouter } from "./statistics-router"

export const router: Router = Router()

router.use("/healthcheck", healthRouter)
router.use("/admin", adminRouter)
router.use("/users", usersRouter)
router.use("/rooms", roomsRouter)
router.use("/films", filmsRouter)
router.use("/sessions", sessionsRouter)
router.use("/statistics", statisticsRouter)
