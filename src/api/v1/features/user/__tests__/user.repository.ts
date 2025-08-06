import { PRISMA_CODES } from "@/constants/common";
import { Prisma, User } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";
import { ApiError } from "@/utils/api-error";

import {
  CreateUserParams,
  USER_ERROR_CODES,
  UserRepository,
  UserRepositoryImpl,
} from "../user.repository";

describe("UserRepositoryImpl", () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepositoryImpl();
  });

  describe("createUser", () => {
    const createParams: CreateUserParams = {
      email: "test@email.com",
      password: "a-really-good-password",
    };

    it("Creates an user correctly", async () => {
      const createdUser: User = {
        ...createParams,
        createdAt: new Date(),
        id: "some-id",
      };

      prismaMock.user.create.mockResolvedValue(createdUser);
      const response = await repository.createUser(createParams);

      expect(response).toEqual(createdUser);
    });

    it("Throws an error if email is already in use by another user", async () => {
      const error = new Prisma.PrismaClientKnownRequestError("Email in use", {
        code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
        clientVersion: "",
      });

      prismaMock.user.create.mockRejectedValue(error);

      const response = repository.createUser(createParams);
      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty(
        "code",
        USER_ERROR_CODES.CREATE.DUPLICATE_EMAIL,
      );
    });

    it("Throws an error if user could not be created", async () => {
      prismaMock.user.create.mockRejectedValue(new Error("Database error"));

      const response = repository.createUser(createParams);

      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty("code", USER_ERROR_CODES.CREATE.INTERNAL_ERROR);
    });
  });
});
