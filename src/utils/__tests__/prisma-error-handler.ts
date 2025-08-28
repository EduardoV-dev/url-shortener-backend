import { PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";

import { PrismaErrorHandlerImpl } from "../prisma-error-handler";

describe("PrismaErrorHandlerImpl", () => {
  describe("PrismaErrorChecker", () => {
    it("Returns true if error is unique constraint", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
        clientVersion: "",
      });

      const isUniqueError = PrismaErrorHandlerImpl.checkUniqueConstraint(prismaError);
      expect(isUniqueError).toBe(true);
    });

    it("Returns false if error is not unique constraint", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: PRISMA_CODES.RECORD_NOT_FOUND,
        clientVersion: "",
      });

      const isUniqueError = PrismaErrorHandlerImpl.checkUniqueConstraint(prismaError);
      expect(isUniqueError).toBe(false);
    });
  });
});
