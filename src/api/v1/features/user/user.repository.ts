import { User } from "@/generated/prisma";

import { ReadRepository, Repository, RepositoryImpl, WriteRepository } from "../../repositories";

export type UserRepository = Repository<User>;

/**
 * Implementation of the UserRepository interface for managing user data.
 * This class provides methods to interact with the user data in the database.
 * @implements UserRepository
 * @class UserRepositoryImpl
 */
export class UserRepositoryImpl extends RepositoryImpl<User> {
  constructor(read: ReadRepository<User>, write: WriteRepository<User>) {
    super(read, write);
  }
}
