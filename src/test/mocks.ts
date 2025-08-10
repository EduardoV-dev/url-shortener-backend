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
  UNIQUE_CONSTRAINT_FAILED: new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
    clientVersion: "",
  }),
});
