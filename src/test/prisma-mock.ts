import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

import { PrismaClient } from "@/generated/prisma/client";

import { prisma } from "../storage/prisma";

jest.mock("../storage/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
