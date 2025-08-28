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
    const entity = error.meta?.modelName || "Unknown entity";
    const fields = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : error.meta?.target || "Unknown field";

    const details = { entity, fields };

    // https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (error.code) {
      case PRISMA_CODES.VALUE_TOO_LONG:
        return new ApiError(`Input value is too long for field(s) in ${entity}.`, {
          details,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      case PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED:
        return new ApiError(`A record of ${entity} already exists with the provided ${fields}`, {
          details,
          status: HTTP_STATUS.CONFLICT,
        });
      case PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED:
        return new ApiError(
          `Could not create a record of ${entity} as foreign key constraint failed.`,
          {
            status: HTTP_STATUS.BAD_REQUEST,
          },
        );
      case PRISMA_CODES.RECORD_NOT_FOUND:
        return new ApiError(`Record of ${entity} not found.`, { status: HTTP_STATUS.NOT_FOUND });
      default:
        return new ApiError("A database error occurred.");
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(
      "Missing or invalid required field(s) in request data. Please ensure all required fields are provided and have valid values.",
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError)
    return new ApiError("Database initialization error.");

  if (error instanceof Prisma.PrismaClientRustPanicError)
    return new ApiError("Prisma engine panic. Please try again later.");

  return new ApiError("An unexpected error occurred.", { details: error });
};

/**
 * Handles errors that occur during request processing.
 * It logs the error and sends a standardized error response to the client.
 * @param {unknown} err - The error that occurred.
 * @param {Request} req - The Express request object.
 * @param {Response<APIResponse>} res - The Express response object.
 * @param {NextFunction} _next - The next middleware function in the stack (not
 * used in this middleware).
 */
export const httpErrorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response<APIResponse>,
  _next: NextFunction,
) => {
  logger.error(`Error occurred during [${req.method}]: ${req.originalUrl}`, err);

  const isApiError = err instanceof ApiError;

  if (isApiError)
    return res.status(err.status).json(new ApiErrorResponse(err.message, err.details).toJSON());

  const apiError = getApiError(err);

  return res
    .status(apiError.status)
    .json(new ApiErrorResponse(apiError.message, apiError.details).toJSON());
};
