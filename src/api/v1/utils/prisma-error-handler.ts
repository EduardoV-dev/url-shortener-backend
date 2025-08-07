import { HTTP_STATUS, PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { logger } from "@/utils/logger";

export interface PrismaHandleErrorParams<T> {
  /**
   * The name of the entity being handled, e.g., "User", "Post".
   * This is used for logging and error messages.
   * @example "User"
   */
  entity: string;
  /**
   * The field that is expected to be unique in the database.
   * This is used to identify the specific unique constraint that failed.
   * @example "email"
   */
  uniqueField: keyof T;
  /**
   * A message to log when an error occurs.
   * This should provide context about the operation being performed.
   * @example "Error creating User"
   */
  loggerMessage: string;
}

interface PrismaErrorHandler {
  /**
   * Checks if the provided error is a Prisma unique constraint violation.
   * @param error - The error to check.
   * @returns `true` if the error is a unique constraint violation, otherwise `false`.
   * @example PrismaErrorHandler.checkUniqueConstraint(error)
   */
  handleError: <T>(params: PrismaHandleErrorParams<T>) => ApiError;
}

/**
 * Handles Prisma errors and converts them into ApiError instances.
 * This class provides a method to handle Prisma errors based on their type and code.
 * It checks for specific Prisma error codes and returns appropriate ApiError instances.
 * @implements PrismaErrorHandler
 * @class PrismaErrorHandlerImpl
 */
export class PrismaErrorHandlerImpl implements PrismaErrorHandler {
  constructor(private error: unknown) {}

  /**
   * Checks if the provided error is a Prisma unique constraint violation.
   * @param error - The error to check.
   * @returns `true` if the error is a unique constraint violation, otherwise `false`.
   * @example PrismaErrorHandler.checkUniqueConstraint(error)
   * @static
   */
  public static checkUniqueConstraint = (error: unknown): boolean =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED;

  public handleError: PrismaErrorHandler["handleError"] = ({
    entity,
    loggerMessage,
    uniqueField,
  }): ApiError => {
    logger.error(loggerMessage, this.error);

    if (this.error instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference
      switch (this.error.code) {
        case PRISMA_CODES.VALUE_TOO_LONG:
          return new ApiError("Input value is too long for a field.")
            .setStatus(HTTP_STATUS.BAD_REQUEST)
            .setDetails(this.error);
        case PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED:
          return new ApiError(`${entity} with this ${String(uniqueField)} value already exists.`)
            .setStatus(HTTP_STATUS.CONFLICT)
            .setDetails(this.error);
        case PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED:
          return new ApiError("Foreign key constraint failed.")
            .setStatus(HTTP_STATUS.BAD_REQUEST)
            .setDetails(this.error);
        case PRISMA_CODES.RECORD_NOT_FOUND:
          return new ApiError(`${entity} not found.`)
            .setStatus(HTTP_STATUS.NOT_FOUND)
            .setDetails(this.error);
        default:
          return new ApiError("A database error occurred.")
            .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .setDetails(this.error);
      }
    }

    if (this.error instanceof Prisma.PrismaClientValidationError)
      return new ApiError("Invalid input data.")
        .setStatus(HTTP_STATUS.BAD_REQUEST)
        .setDetails(this.error);

    if (this.error instanceof Prisma.PrismaClientInitializationError)
      return new ApiError("Database initialization error.")
        .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .setDetails(this.error);

    if (this.error instanceof Prisma.PrismaClientRustPanicError)
      return new ApiError("Prisma engine panic. Please try again later.")
        .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .setDetails(this.error);

    return new ApiError("An unexpected error occurred.")
      .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .setDetails(this.error);
  };
}
