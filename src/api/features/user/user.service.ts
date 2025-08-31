import bcrypt from "bcrypt";

import { ENVS } from "@/config/env";
import { User } from "@/generated/prisma";
import { logger } from "@/utils/logger";

import { UserRepository } from "./user.repository";

export type CreateUserParams = Pick<User, "email" | "password" | "isAdmin">;

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

/**
 * Implementation of the UserService interface.
 * It uses the UserRepository for database operations.
 */
export class UserServiceImpl implements UserService {
  constructor(private repository: UserRepository) {}

  public create: UserService["create"] = async ({ email, password, isAdmin }) => {
    logger.info(`Creating user with email: ${email}`);
    const hashed = await this.hashPassword(password);
    return this.repository.create({ email, password: hashed, isAdmin });
  };

  public findByEmail: UserService["findByEmail"] = (email) => {
    logger.info(`Retrieving user for email: ${email}`);
    return this.repository.findOne().setWhere({ email }).execute();
  };

  private hashPassword = (password: string): Promise<string> =>
    bcrypt.hash(password, ENVS.BCRYPT_SALT_ROUNDS);
}
