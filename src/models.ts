import {
  Film,
  Room,
  Session,
  Ticket,
  Token,
  Transaction,
  User,
} from "@prisma/client"

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
  tokens: Token[]
  tickets: Ticket[]
  transactions: Transaction[]
}
