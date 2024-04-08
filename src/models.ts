import {
  Film,
  Room,
  Session,
  Ticket,
  Token,
  Transaction,
  User,
} from "@prisma/client"

declare global {
  namespace Express {
    interface Request {
      user: User
    }
    interface Response {
      user: User
    }
  }
}

export interface TokenWithUser extends Token {
  user: User
}

export interface SessionWithAll extends Session {
  room: Room
  film: Film
  tickets: Ticket[]
}

export interface SessionWithoutTickets extends Session {
  room: Room
  film: Film
}

export interface UserAll extends User {
  tokens?: Token[]
  tickets?: Ticket[]
  transactions?: Transaction[]
}

export interface SessionAll extends Session {
  tickets?: Ticket[]
  room?: Room
  film?: Film
}
