import { PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";

/**
 * Utility class to check for specific Prisma errors.
 * This class provides static methods to check for known Prisma error codes.
 * @example
 * ```typescript
 * import { PrismaErrorChecker } from "@/utils/error-handlers";
 *
 * if (PrismaErrorChecker.checkuniqueConstraint(error)) {
 *   // Do something
 * }
 */
export class PrismaErrorChecker {
  public static checkUniqueConstraint = (error: unknown): boolean =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED;
}
