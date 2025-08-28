/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type representing a partial object of type T, used for filtering and selection.
 */
export type Where<T> = Partial<T>;

export type Model = any;

/**
 * Base repository class for Prisma ORM operations.
 * Provides access to the Prisma model delegate for CRUD operations.
 * @example
 * import { prisma } from "@generated/prisma";
 *
 * export class RepositoryMethod<T> extends BaseRepository {
 *    super(prisma.url)
 * }
 */
export abstract class PrismaModel {
  /**
   * Prisma model used for database operations.
   * This should be defined in subclasses to specify the model being managed.
   */
  constructor(protected readonly model: Model) {}
}
