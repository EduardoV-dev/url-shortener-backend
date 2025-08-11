/* eslint-disable @typescript-eslint/no-explicit-any */

import { PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";

export const MOCK_RESPONSE_EXPRESS: any = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

export type MockInterface<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K] extends (
    ...args: any[]
  ) => any
    ? jest.MockedFunction<T[K]>
    : never;
};

export const MOCK_PRISMA_ERRORS = Object.freeze({
  CLIENT_INITIALIZATION_ERROR: new Prisma.PrismaClientInitializationError(
    "Database initialization error",
    "",
  ),
  CLIENT_RUST_PANIC_ERROR: new Prisma.PrismaClientRustPanicError("Prisma engine panic", ""),
  CLIENT_VALIDATION_ERROR: new Prisma.PrismaClientValidationError("Invalid input data", {
    clientVersion: "",
  }),
  FOREIGN_KEY_CONSTRAINT_FAILED: new Prisma.PrismaClientKnownRequestError(
    "Foreign key constraint failed",
    {
      code: PRISMA_CODES.FOREIGN_KEY_CONSTRAINT_FAILED,
      clientVersion: "",
    },
  ),
  UNIQUE_CONSTRAINT_FAILED: new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
    clientVersion: "",
  }),
  RECORD_NOT_FOUND: new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: PRISMA_CODES.RECORD_NOT_FOUND,
    clientVersion: "",
  }),
  VALUE_TOO_LONG: new Prisma.PrismaClientKnownRequestError("Value too long", {
    code: PRISMA_CODES.VALUE_TOO_LONG,
    clientVersion: "",
  }),
});
