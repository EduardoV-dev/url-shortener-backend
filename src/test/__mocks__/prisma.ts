import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

import { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/libs/prisma";

jest.mock("@/libs/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
