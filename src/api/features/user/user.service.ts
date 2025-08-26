import bcrypt from "bcrypt";

import { User } from "@/generated/prisma";
import { logger } from "@/utils/logger";

import { UserRepository } from "./user.repository";

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
   *
   * Retrieves a user by their email address.
   * @param email - The email address of the user to retrieve.
   * @returns A promise that resolves to the user if found, or null if not found
   */
  findByEmail: (email: string) => Promise<User | null>;
}

/**
 * Number of rounds to use when hashing passwords with bcrypt.
 */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Implementation of the UserService interface.
 * It uses the UserRepository for database operations.
 */
export class UserServiceImpl implements UserService {
  constructor(private repository: UserRepository) {}

  public create: UserService["create"] = async ({ email, password }) => {
    logger.info(`Creating user with email: ${email}`);
    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    return this.repository.create({ email, password: hashed });
  };

  public findByEmail: UserService["findByEmail"] = (email) => {
    logger.info(`Retrieving user for email: ${email}`);
    return this.repository.findOne().setWhere({ email }).execute();
  };
}
