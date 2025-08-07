import bcrypt from "bcrypt";

import { User } from "@/generated/prisma";
import { logger } from "@/utils/logger";

import { PrismaErrorHandlerImpl } from "../../utils/prisma-error-handler";
import { CreateUserParams, UserRepository } from "./user.repository";

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
  constructor(private userRepository: UserRepository) {}

  public createUser: UserService["createUser"] = async ({ email, password }) => {
    logger.info("Creating user with email:", email);

    try {
      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      return await this.userRepository.write.create({ email, password: hashed });
    } catch (error) {
      throw new PrismaErrorHandlerImpl(error).handleError({
        entity: "User",
        uniqueField: "email",
        loggerMessage: "UserShortenerService.createUser | Error creating User",
      });
    }
  };
}
