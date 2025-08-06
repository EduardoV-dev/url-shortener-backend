import { User } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";
import { ApiError } from "@/utils/api-error";

import { PrismaErrorChecker } from "../../utils/error-handlers";

export const USER_ERROR_CODES = {
  CREATE: {
    INTERNAL_ERROR: "USER_REPO_CREATE_INTERNAL_ERROR",
    DUPLICATE_EMAIL: "USER_REPO_CREATE_DUPLICATE_EMAIL",
  },
};

export type CreateUserParams = Pick<User, "email" | "password">;

export interface UserRepository {
  /**
   * Creates a new user in the database.
   * @param params - The parameters for creating a user.
   * @returns A promise that resolves to the created user.
   * @throws ApiError if the user could not be created due to a duplicate email or
   * other internal error.
   */
  createUser: (params: CreateUserParams) => Promise<User>;
}

/**
 * Implementation of the UserRepository interface for managing user data.
 * This class provides methods to interact with the user data in the database.
 * @implements UserRepository
 * @class UserRepositoryImpl
 */
export class UserRepositoryImpl implements UserRepository {
  public createUser: UserRepository["createUser"] = async (data) => {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      if (PrismaErrorChecker.checkUniqueConstraint(error))
        throw new ApiError(`Email already exists: ${data.email}`).setCode(
          USER_ERROR_CODES.CREATE.DUPLICATE_EMAIL,
        );

      throw new ApiError("Internal server error while creating user").setCode(
        USER_ERROR_CODES.CREATE.INTERNAL_ERROR,
      );
    }
  };
}
