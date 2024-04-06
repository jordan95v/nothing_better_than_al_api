import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { generatePrismaErrorMessage } from "./generate-error-message"
import { Response } from "express"

export const handleError = async (error: any, res: Response): Promise<void> => {
  if (error instanceof PrismaClientKnownRequestError) {
    const message = await generatePrismaErrorMessage(error)
    res.status(400).send(message)
  }
  res.status(500).send("Internal Server Error")
}
