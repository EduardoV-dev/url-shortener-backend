import { MockInterface } from "@/test/__mocks__/common";

import { UserService } from "../user.service";

export type MockUserService = MockInterface<UserService>;

export const MOCK_USER_SERVICE: MockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};
