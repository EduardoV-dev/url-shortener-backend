import { PrismaClient, User } from "@/generated/prisma";
import { Repository, RepositoryImpl } from "@/repository";

export type UserRepository = Repository<User>;

/**
 * Implementation of the UserRepository interface for managing user data.
 * This class provides methods to interact with the user data in the database.
 * @implements UserRepository
 * @class UserRepositoryImpl
 */
export class UserRepositoryImpl extends RepositoryImpl<User> implements UserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma.user);
  }
}
