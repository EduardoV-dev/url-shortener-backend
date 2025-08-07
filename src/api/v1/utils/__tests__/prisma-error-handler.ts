import { HTTP_STATUS, PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";

import { PrismaErrorHandlerImpl, PrismaHandleErrorParams } from "../prisma-error-handler";

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

  describe("handlePrismaError", () => {
    const params: PrismaHandleErrorParams<{ data: string }> = {
      entity: "Example",
      uniqueField: "data",
      loggerMessage: "An error occurred while processing the request",
    };

    describe("PrismaClientKnownRequestError", () => {
      it("Handles VALUE_TOO_LONG error", () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError("Value too long", {
          code: PRISMA_CODES.VALUE_TOO_LONG,
          clientVersion: "",
        });

        const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
        expect(apiError.message).toBeDefined();
        expect(apiError.status).toBe(HTTP_STATUS.BAD_REQUEST);
      });

      it("Handles UNIQUE_CONSTRAINT_FAILED error", () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
          clientVersion: "",
        });

        const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
        expect(apiError.message).toBeDefined();
        expect(apiError.status).toBe(HTTP_STATUS.CONFLICT);
      });

      it("Handles FOREIGN_KEY_CONSTRAINT_FAILED error", () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          "Foreign key constraint failed",
          {
            code: PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED,
            clientVersion: "",
          },
        );

        const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
        expect(apiError.message).toBeDefined();
        expect(apiError.status).toBe(HTTP_STATUS.BAD_REQUEST);
      });

      it("Handles RECORD_NOT_FOUND error", () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
          code: PRISMA_CODES.RECORD_NOT_FOUND,
          clientVersion: "",
        });

        const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
        expect(apiError.message).toBeDefined();
        expect(apiError.status).toBe(HTTP_STATUS.NOT_FOUND);
      });

      it("Handles unknown PrismaClientKnownRequestError", () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError("Unknown error", {
          code: "UNKNOWN_ERROR",
          clientVersion: "",
        });

        const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
        expect(apiError.message).toBeDefined();
        expect(apiError.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      });
    });

    it("Handles PrismaClientValidationError", () => {
      const prismaError = new Prisma.PrismaClientValidationError("Invalid input data", {
        clientVersion: "",
      });

      const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
      expect(apiError.message).toBeDefined();
      expect(apiError.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("Handles PrismaClientInitializationError", () => {
      const prismaError = new Prisma.PrismaClientInitializationError(
        "Database initialization error",
        "",
      );

      const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
      expect(apiError.message).toBeDefined();
      expect(apiError.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it("Handles PrismaClientRustPanicError", () => {
      const prismaError = new Prisma.PrismaClientRustPanicError("Prisma engine panic", "");
      const apiError = new PrismaErrorHandlerImpl(prismaError).handleError(params);
      expect(apiError.message).toBeDefined();
      expect(apiError.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it("Handles unknown error", () => {
      const unknownError = new Error("Unknown error");
      const apiError = new PrismaErrorHandlerImpl(unknownError).handleError(params);
      expect(apiError.message).toBeDefined();
      expect(apiError.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it("Inside a try catch, throws the error correctly", async () => {
      const promise = () => new Promise((_, reject) => reject("fail"));

      try {
        try {
          await promise();
        } catch (err) {
          throw new PrismaErrorHandlerImpl(err).handleError(params);
        }
      } catch (err) {
        const error = err as ApiError;
        expect(error.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
