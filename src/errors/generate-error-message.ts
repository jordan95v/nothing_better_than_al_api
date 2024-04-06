import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export interface HttpError {
  status: number
  message: string
}

export const generatePrismaErrorMessage = async (
  error: PrismaClientKnownRequestError
): Promise<HttpError> => {
  const modelName = error.meta?.modelName
  const field = error.meta?.target
  let errorMessage = ""
  let status = 400
  switch (error.code) {
    case "P2002":
      errorMessage = `${modelName} with this ${field} already exists`
      status = 409
      break
    case "P2025":
      errorMessage = `${modelName} not found`
      status = 404
      break
    default:
      errorMessage = "Something went wrong"
      break
  }
  return { status: status, message: errorMessage }
}
