import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { MOCK_USER } from "@/api/v1/test/users.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { MOCK_PRISMA_ERRORS } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";

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

    it("Throws a different error than ApiError when an unexpected error occurs (like bcrypt not working)", async () => {
      const error = new Error("Bcrypt hash did not work");
      repository.write.create.mockRejectedValue(error);

      const response = service.create(params);

      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response).rejects.toHaveProperty("details", error);
    });

    it("Throws error when email already exists", async () => {
      repository.write.create.mockRejectedValue(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);

      const response = service.create(params);

      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.CONFLICT);
    });

    it("Throws error on internal server error", async () => {
      repository.write.create.mockRejectedValue(new Error("Internal server error"));

      const response = service.create(params);

      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe("findByEmail", () => {
    it("Should return user by email", async () => {
      repository.read.setWhere({ email: MOCK_USER.email }).findOne = jest
        .fn()
        .mockResolvedValue(MOCK_USER);

      const response = await service.findByEmail(MOCK_USER.email);
      expect(response).toEqual(MOCK_USER);
    });

    it("Throws an error when something goes wrong", async () => {
      repository.read.findOne.mockRejectedValue(
        new ApiError("Message").setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      const response = service.findByEmail(MOCK_USER.email);
      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });
});
