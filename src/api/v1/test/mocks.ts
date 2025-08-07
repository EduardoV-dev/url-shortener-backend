import { PRISMA_CODES } from "@/constants/common";
import { Prisma, Url, User } from "@/generated/prisma";

import { MockRepository } from "../repositories";

export const MOCK_URLS: Url[] = [
  {
    id: "1",
    longUrl: "https://example.com/1",
    createdAt: new Date(),
    shortId: "shortId1",
    userId: "user1",
  },
  {
    id: "2",
    longUrl: "https://example.com/2",
    createdAt: new Date(),
    shortId: "shortId2",
    userId: "user2",
  },
  {
    id: "3",
    longUrl: "https://example.com/3",
    createdAt: new Date(),
    shortId: "shortId3",
    userId: "user3",
  },
];

export const MOCK_URL: Url = MOCK_URLS[0];

const createMockRepository = (): MockRepository => ({
  read: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    setSelect: jest.fn(),
    setWhere: jest.fn(),
  },
  write: {
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
});

export const MOCK_REPOSITORY = createMockRepository();

export const MOCK_PRISMA_ERRORS = Object.freeze({
  UNIQUE_CONSTRAINT_FAILED: new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
    clientVersion: "",
  }),
});

export const MOCK_USER: User = {
  createdAt: new Date("2025-08-08T16:23"),
  email: "created@gmail.com",
  id: "1",
  password: "hashed-password",
};
