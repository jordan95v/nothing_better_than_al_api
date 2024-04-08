import { RoomType } from "@prisma/client"

export const DEFAULT_CONFIG = {
  LIMIT: 10,
  PAGE: 0,
  MAINTENANCE_TIME: 30,
  MIN_SESSION_START_AT: 9,
  MAX_SESSION_START_AT: 20,
}

export enum RoomCapacity {
  MIN = 15,
  MAX = 30,
}

export const roomBasePrice = {
  [RoomType.STANDARD]: 10,
  [RoomType.IMAX]: 16,
}
