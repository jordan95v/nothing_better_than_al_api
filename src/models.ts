import { Film, Session, Token, User } from "@prisma/client"

export interface SessionWithFilm extends Session {
  film: Film
}

export interface TokenWithUser extends Token {
  user: User
}
