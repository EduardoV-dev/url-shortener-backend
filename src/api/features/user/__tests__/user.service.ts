import { User } from "@/generated/prisma";
import { createMockRepository, MockRepository } from "@/repository/__tests__/mocks";

import { CreateUserParams, UserService, UserServiceImpl } from "../user.service";
import { MOCK_USER } from "./mocks";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

describe("UserService", () => {
  let repository: MockRepository<User>;
  let service: UserService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserServiceImpl(repository);
  });

  describe("create", () => {
    const params: CreateUserParams = {
      email: MOCK_USER.email,
      password: MOCK_USER.password,
    };

    it("Creates a new user successfully", async () => {
      repository.create.mockResolvedValue(MOCK_USER);
      const response = await service.create(params);
      expect(response).toEqual(MOCK_USER);
    });
  });

  describe("findByEmail", () => {
    it("Should return user by email", async () => {
      repository.findOne().setWhere({ email: MOCK_USER.email }).execute = jest
        .fn()
        .mockResolvedValue(MOCK_USER);

      const response = await service.findByEmail(MOCK_USER.email);
      expect(response).toEqual(MOCK_USER);
    });
  });
});
