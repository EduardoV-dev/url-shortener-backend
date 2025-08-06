import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";

import { CreateUserParams, USER_ERROR_CODES, UserRepository } from "../user.repository";
import { UserService, UserServiceImpl } from "../user.service";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

describe("UserService", () => {
  let repository: jest.Mocked<UserRepository>;
  let service: UserService;

  beforeEach(() => {
    repository = {
      createUser: jest.fn(),
    };
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
    repository.createUser.mockResolvedValue(createdUser);
    const response = await service.createUser(params);
    expect(response).toEqual(createdUser);
  });

  it("Throws a different error than ApiError when an unexpected error occurs (like bcrypt not working)", async () => {
    const error = new Error("Bcrypt hash did not work");
    repository.createUser.mockRejectedValue(error);

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("code", USER_ERROR_CODES.CREATE.INTERNAL_ERROR);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response).rejects.toHaveProperty("details", error);
  });

  it("Throws error when email already exists", async () => {
    const error = new ApiError("Email already exists").setCode(
      USER_ERROR_CODES.CREATE.DUPLICATE_EMAIL,
    );

    repository.createUser.mockRejectedValue(error);

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("code", USER_ERROR_CODES.CREATE.DUPLICATE_EMAIL);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.CONFLICT);
  });

  it("Throws error on internal server error", async () => {
    const error = new ApiError("Internal server error").setCode(
      USER_ERROR_CODES.CREATE.INTERNAL_ERROR,
    );

    repository.createUser.mockRejectedValue(error);

    const response = service.createUser(params);

    expect(response).rejects.toThrow(ApiError);
    expect(response).rejects.toHaveProperty("code", USER_ERROR_CODES.CREATE.INTERNAL_ERROR);
    expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
