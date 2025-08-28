import { User } from "@/generated/prisma";
import { MockInterface } from "@/test/__mocks__/common";

import { UserService } from "../user.service";

export const MOCK_USER: User = {
  createdAt: new Date("2025-08-08T16:23"),
  email: "created@gmail.com",
  id: "1",
  isDeleted: false,
  password: "hashed-password",
  updatedAt: new Date("2025-08-08T16:23"),
};

export type MockUserService = MockInterface<UserService>;

export const MOCK_USER_SERVICE: MockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};
