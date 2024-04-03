import { Role, User } from "@prisma/client"
import { prisma } from "."
import { compare } from "bcrypt"

export const adminAuth = async (
  username: string,
  password: string,
  cb: CallableFunction
) => {
  const user: User | null = await prisma.user.findUnique({
    where: { email: username },
  })
  if (user === null) {
    return cb(null, false)
  }
  if ((await compare(password, user.password)) === false) {
    return cb(null, false)
  }
  if (user.role !== Role.ADMIN) {
    return cb(null, false)
  }
  return cb(null, true)
}
