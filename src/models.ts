import { Film, Room, Session, Token, User } from "@prisma/client"

export interface SessionWithFilm extends Session {
  film: Film
}

export interface TokenWithUser extends Token {
  user: User
}

export interface SessionWithRoom extends Session {
  room: Room
}
