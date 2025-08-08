import bcrypt from "bcrypt";

import { User } from "@/generated/prisma";
import { MockInterface } from "@/test/mocks";
import { logger } from "@/utils/logger";

import { Repository } from "../../repositories";
import { PrismaErrorHandlerImpl } from "../../utils/prisma-error-handler";

export type CreateUserParams = Pick<User, "email" | "password">;

export interface UserService {
  /**
   * Creates a new user in the database.
   * @param params - The parameters for creating a user.
   * @returns A promise that resolves to the created user.
   * @throws ApiError if the user could not be created due to a duplicate email or
   * another internal error.
   */
  create: (params: CreateUserParams) => Promise<User>;
  /**
   * Retrieves a user by their email address.
   * @param email - The email address of the user to retrieve.
   * @returns A promise that resolves to the user if found, or null if not found
   */
  findByEmail: (email: string) => Promise<User | null>;
}

const BCRYPT_SALT_ROUNDS = 10;

export class UserServiceImpl implements UserService {
  constructor(private repository: Repository<User>) {}

  public create: UserService["create"] = async ({ email, password }) => {
    logger.info("Creating user with email:", email);

    try {
      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      return await this.repository.write.create({ email, password: hashed });
    } catch (error) {
      throw PrismaErrorHandlerImpl.handleError({
        entity: "User",
        error,
        loggerMessage: "UserShortenerService.createUser | Error creating User",
        uniqueField: "email",
      });
    }
  };

  public findByEmail: UserService["findByEmail"] = async (email) => {
    logger.info("Retrieving user by email:", email);

    try {
      return await this.repository.read.setWhere({ email }).findOne();
    } catch (error) {
      throw PrismaErrorHandlerImpl.handleError({
        entity: "User",
        error,
        loggerMessage: "UserService.getUserByEmail | Error retrieving User by email",
        uniqueField: "email",
      });
    }
  };
}

// === For testing purposes ===

export type MockUserService = MockInterface<UserService>;

export const MOCK_USER_SERVICE: MockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};
