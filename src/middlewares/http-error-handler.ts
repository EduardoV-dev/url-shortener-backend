import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS, PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { logger } from "@/utils/logger";

/**
 * Handles Prisma errors and converts them into ApiError instances.
 * This function checks for specific Prisma error codes and returns appropriate ApiError instances.
 * It is used to handle errors that occur during database operations.
 * @param {unknown} error - The error that occurred during a Prisma operation.
 * @returns {ApiError} An instance of ApiError with the appropriate status and message based
 */
const getApiError = (error: unknown): ApiError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (error.code) {
      case PRISMA_CODES.VALUE_TOO_LONG:
        return new ApiError("Input value is too long for a field.")
          .setStatus(HTTP_STATUS.BAD_REQUEST)
          .setDetails(error);
      case PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED:
        return new ApiError("A unique constraint failed.")
          .setStatus(HTTP_STATUS.CONFLICT)
          .setDetails(error);
      case PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED:
        return new ApiError("Foreign key constraint failed.")
          .setStatus(HTTP_STATUS.BAD_REQUEST)
          .setDetails(error);
      case PRISMA_CODES.RECORD_NOT_FOUND:
        return new ApiError("Record not found.").setStatus(HTTP_STATUS.NOT_FOUND).setDetails(error);
      default:
        return new ApiError("A database error occurred.")
          .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .setDetails(error);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError)
    return new ApiError("Invalid input data.").setStatus(HTTP_STATUS.BAD_REQUEST).setDetails(error);

  if (error instanceof Prisma.PrismaClientInitializationError)
    return new ApiError("Database initialization error.")
      .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .setDetails(error);

  if (error instanceof Prisma.PrismaClientRustPanicError)
    return new ApiError("Prisma engine panic. Please try again later.")
      .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .setDetails(error);

  return new ApiError("An unexpected error occurred.")
    .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .setDetails(error);
};

/**
 * Handles errors that occur during request processing.
 * It logs the error and sends a standardized error response to the client.
 * @param {unknown} err - The error that occurred.
 * @param {Request} req - The Express request object.
 * @param {Response<APIResponse>} res - The Express response object.
 * @param {NextFunction} _next - The next middleware function in the stack (not
 * used in this middleware).
 * @returns {void}
 */
export const httpErrorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response<APIResponse>,
  _next: NextFunction,
): void => {
  logger.error(`Error occurred during [${req.method}]: ${req.originalUrl}`, err);

  const apiError = getApiError(err);

  res
    .status(apiError.status)
    .json(new ApiErrorResponse(apiError.message, apiError.details).toJSON());
};
