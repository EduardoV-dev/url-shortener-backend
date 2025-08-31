import { User } from "@/generated/prisma";
import { createMockRepository, MockRepository } from "@/repository/__tests__/mocks";
import { MOCK_ADMIN_USER, MOCK_USER } from "@/test/__fixtures__/user";
import { logger } from "@/utils/logger";

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
    const creationParams: CreateUserParams = {
      email: MOCK_USER.email,
      password: "plain-password",
      isAdmin: false,
    };

    it("Logs action", () => {
      service.create(creationParams);
      expect(logger.info).toHaveBeenCalled();
    });

    it("Creates a new user successfully", async () => {
      repository.create.mockResolvedValue(MOCK_USER);
      const response = await service.create(creationParams);

      expect(response).toEqual(MOCK_USER);
      expect(repository.create).toHaveBeenCalledWith({
        ...creationParams,
        password: MOCK_USER.password,
      });
    });

    it("Creates a new admin user successfully", async () => {
      creationParams.isAdmin = true;
      repository.create.mockResolvedValue(MOCK_ADMIN_USER);

      const response = await service.create(creationParams);

      expect(response).toEqual(MOCK_ADMIN_USER);
      expect(repository.create).toHaveBeenCalledWith({
        ...creationParams,
        password: MOCK_ADMIN_USER.password,
        isAdmin: true,
      });
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
