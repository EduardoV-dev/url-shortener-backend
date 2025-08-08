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
   * The error that occurred during a Prisma operation.
   * This should be an instance of `PrismaClientKnownRequestError` or similar.
   */
  error: unknown;
  /**
   * A message to log when an error occurs.
   * This should provide context about the operation being performed.
   * @example "Error creating User"
   */
  loggerMessage: string;
  /**
   * The field that is expected to be unique in the database.
   * This is used to identify the specific unique constraint that failed.
   * @example "email"
   */
  uniqueField: keyof T;
}

/**
 * Handles Prisma errors and converts them into ApiError instances.
 * This class provides a method to handle Prisma errors based on their type and code.
 * It checks for specific Prisma error codes and returns appropriate ApiError instances.
 * @implements PrismaErrorHandler
 * @class PrismaErrorHandlerImpl
 */
export class PrismaErrorHandlerImpl {
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

  /**
   * Handles Prisma errors and converts them into ApiError instances.
   * This method logs the error and returns an ApiError based on the Prisma error code.
   * It checks for known Prisma error codes and returns appropriate ApiError instances.
   * If the error does not match any known codes, it returns a generic ApiError.
   * @param params - The parameters for handling the error.
   * @returns An instance of ApiError with the appropriate status and message based on the Prisma error.
   * @example
   * try {
   *    // Any prisma operation here
   * } catch (error) {
   *    throw PrismaErrorHandler.handleError({entity: "User", error, loggerMessage: "Error creating User", uniqueField: "email"});
   * }
   */
  public static handleError = <T>({
    entity,
    error,
    loggerMessage,
    uniqueField,
  }: PrismaHandleErrorParams<T>): ApiError => {
    logger.error(loggerMessage, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference
      switch (error.code) {
        case PRISMA_CODES.VALUE_TOO_LONG:
          return new ApiError("Input value is too long for a field.")
            .setStatus(HTTP_STATUS.BAD_REQUEST)
            .setDetails(error);
        case PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED:
          return new ApiError(`${entity} with this ${String(uniqueField)} value already exists.`)
            .setStatus(HTTP_STATUS.CONFLICT)
            .setDetails(error);
        case PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED:
          return new ApiError("Foreign key constraint failed.")
            .setStatus(HTTP_STATUS.BAD_REQUEST)
            .setDetails(error);
        case PRISMA_CODES.RECORD_NOT_FOUND:
          return new ApiError(`${entity} not found.`)
            .setStatus(HTTP_STATUS.NOT_FOUND)
            .setDetails(error);
        default:
          return new ApiError("A database error occurred.")
            .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .setDetails(error);
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError)
      return new ApiError("Invalid input data.")
        .setStatus(HTTP_STATUS.BAD_REQUEST)
        .setDetails(error);

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
}
