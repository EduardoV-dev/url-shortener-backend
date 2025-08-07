import { MockRepository } from "@/api/v1/repositories";
import { MOCK_PRISMA_ERRORS, MOCK_REPOSITORY } from "@/api/v1/test/mocks";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";

import { CreateUserParams } from "../user.repository";
import { UserService, UserServiceImpl } from "../user.service";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

describe("UserService", () => {
  let repository: MockRepository;
  let service: UserService;

  beforeEach(() => {
    repository = MOCK_REPOSITORY;
    service = new UserServiceImpl(repository);
  });

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
    const response = await service.createUser(params);
    expect(response).toEqual(createdUser);
  });

  it("Throws a different error than ApiError when an unexpected error occurs (like bcrypt not working)", async () => {
    const error = new Error("Bcrypt hash did not work");
    repository.write.create.mockRejectedValue(error);

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response).rejects.toHaveProperty("details", error);
  });

  it("Throws error when email already exists", async () => {
    repository.write.create.mockRejectedValue(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.CONFLICT);
  });

  it("Throws error on internal server error", async () => {
    repository.write.create.mockRejectedValue(new Error("Internal server error"));

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
