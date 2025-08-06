import bcrypt from "bcrypt";

import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { logger } from "@/utils/logger";

import { CreateUserParams, USER_ERROR_CODES } from "./user.repository";

export interface UserService {
  /**
   * Creates a new user in the database.
   * @param params - The parameters for creating a user.
   * @returns A promise that resolves to the created user.
   * @throws ApiError if the user could not be created due to a duplicate email or
   * another internal error.
   */
  createUser: (params: CreateUserParams) => Promise<User>;
}

const BCRYPT_SALT_ROUNDS = 10;

export class UserServiceImpl implements UserService {
  constructor(private userRepository: UserService) {}

  public createUser: UserService["createUser"] = async ({ email, password }) => {
    logger.info("Creating user with email:", email);

    try {
      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      return await this.userRepository.createUser({ email, password: hashed });
    } catch (error) {
      logger.error("Error creating user:", error);

      if (!(error instanceof ApiError))
        throw new ApiError("An unexpected error occurred while creating the user")
          .setCode(USER_ERROR_CODES.CREATE.INTERNAL_ERROR)
          .setDetails(error)
          .setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      const err = error as ApiError;

      switch (err.code) {
        case USER_ERROR_CODES.CREATE.DUPLICATE_EMAIL:
          err.setStatus(HTTP_STATUS.CONFLICT);
          break;
        default:
          err.setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      throw err;
    }
  };
}
