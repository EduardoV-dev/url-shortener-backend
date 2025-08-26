import { PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";

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
}
