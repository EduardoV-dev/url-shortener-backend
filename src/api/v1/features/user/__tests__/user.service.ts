import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { MOCK_USER } from "@/api/v1/test/users.mocks";
import { User } from "@/generated/prisma";

import { CreateUserParams, UserService, UserServiceImpl } from "../user.service";

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
    const createdUser: User = {
      createdAt: new Date(),
      email: "created@gmail.com",
      id: "1",
      password: "hashed-password",
    };

    const params: CreateUserParams = {
      email: createdUser.email,
      password: "password",
    };

    it("Creates a new user successfully", async () => {
      repository.write.create.mockResolvedValue(createdUser);
      const response = await service.create(params);
      expect(response).toEqual(createdUser);
    });
  });

  describe("findByEmail", () => {
    it("Should return user by email", async () => {
      repository.read.findOne().setWhere({ email: MOCK_USER.email }).execute = jest
        .fn()
        .mockResolvedValue(MOCK_USER);

      const response = await service.findByEmail(MOCK_USER.email);
      expect(response).toEqual(MOCK_USER);
    });
  });
});
