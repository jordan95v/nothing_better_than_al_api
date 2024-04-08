import { faker } from "@faker-js/faker"
import {
  FilmType,
  PrismaClient,
  RoomType,
  TransactionType,
  User,
  Session,
  Transaction,
  Film,
  Room,
  Role,
  Ticket,
} from "@prisma/client"
import { hash } from "bcrypt"
import { RoomCapacity, roomBasePrice } from "../config"

const prisma = new PrismaClient()

const createUsers = async (count: number): Promise<User[]> => {
  let users: User[] = []
  for (let i = 0; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: await hash(faker.internet.password(), 10),
        role: Role.USER,
        money: parseInt(faker.finance.amount()),
        createdAt: faker.date.past(),
      },
    })
    users.push(user)
  }
  return users
}

const createAdmin = async (): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      email: process.env.API_ADMIN_EMAIL ?? "admin@admin.fr",
      firstName: "admin",
      lastName: "admin",
      password: await hash(process.env.API_ADMIN_PASSWORD ?? "admin", 10),
      role: Role.ADMIN,
      money: 0,
      createdAt: new Date(),
    },
  })
  return user
}

const createTransaction = async (users: User[]): Promise<Transaction[]> => {
  const transactions: Transaction[] = []
  for (let i = 0; i < 10; i++) {
    const transaction = await prisma.transaction.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        amount: parseFloat(faker.finance.amount()),
        type: faker.helpers.arrayElement(Object.values(TransactionType)),
        createdAt: faker.date.past(),
      },
    })
    transactions.push(transaction)
  }
  return transactions
}

const createTicket = async (
  count: number,
  users: User[],
  sessions: Session[],
  transactions: Transaction[]
): Promise<Ticket[]> => {
  let tickets: Ticket[] = []
  for (let i = 0; i < count; i++) {
    const ticket = await prisma.ticket.create({
      data: {
        session: { connect: { id: faker.helpers.arrayElement(sessions).id } },
        user: { connect: { id: faker.helpers.arrayElement(users).id } },
        transaction: {
          create: {
            amount: parseFloat(faker.finance.amount()),
            type: TransactionType.BUY,
            createdAt: faker.date.past(),
            userId: faker.helpers.arrayElement(users).id,
          },
        },
        used: faker.datatype.boolean(),
        createdAt: faker.date.past(),
      },
    })
    tickets.push(ticket)
  }
  return tickets
}

const createRoom = async (count: number): Promise<Room[]> => {
  let rooms: Room[] = []
  for (let i = 0; i < count; i++) {
    const room = await prisma.room.create({
      data: {
        name: faker.commerce.productName(),
        number: i + 1,
        description: faker.commerce.productDescription(),
        images: [faker.image.url()],
        type: faker.helpers.arrayElement(Object.values(RoomType)),
        capacity: faker.number.int({
          min: RoomCapacity.MIN,
          max: RoomCapacity.MAX,
        }),
        handicap: faker.datatype.boolean(),
        maintenance: faker.datatype.boolean(),
        basePrice: faker.helpers.arrayElement(Object.values(roomBasePrice)),
        createdAt: faker.date.past(),
      },
    })
    rooms.push(room)
  }
  return rooms
}

const createSession = async (count: number): Promise<Session[]> => {
  let sessions: Session[] = []
  const films = await prisma.film.findMany()
  const rooms = await prisma.room.findMany()
  for (let i = 0; i < count; i++) {
    const session = await prisma.session.create({
      data: {
        startAt: faker.date.future(),
        film: { connect: { id: faker.helpers.arrayElement(films).id } },
        room: { connect: { id: faker.helpers.arrayElement(rooms).id } },
        createdAt: faker.date.past(),
      },
    })
    sessions.push(session)
  }
  return sessions
}

const createFilms = async (count: number): Promise<Film[]> => {
  let films: Film[] = []
  for (let i = 0; i < count; i++) {
    const film = await prisma.film.create({
      data: {
        type: faker.helpers.arrayElement(Object.values(FilmType)),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        duration: faker.number.int({ min: 60, max: 180 }),
        image: faker.image.url(),
        createdAt: faker.date.past(),
      },
    })
    films.push(film)
  }
  return films
}

const main = async () => {
  await prisma.ticket.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.room.deleteMany()
  await prisma.film.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  const users = await createUsers(10)
  await createAdmin()
  const transactions = await createTransaction(users)
  await createRoom(10)
  await createFilms(10)
  const sessions = await createSession(10)
  await createTicket(10, users, sessions, transactions)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
