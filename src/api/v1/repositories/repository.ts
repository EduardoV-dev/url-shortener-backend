import { ReadRepository } from "./read-repository";
import { WriteRepository } from "./write-repository";

export interface Repository<T> {
  /**
   * Read repository for performing read operations.
   */
  read: ReadRepository<T>;
  /**
   * Write repository for performing write operations.
   */
  write: WriteRepository<T>;
}

// TODO: Refactor repository to not use read and write, but instead, have its methods at the same level
// TODO: Place repository at src level, not in api/v1, so it can be used in other APIs
/**
 * Generic repository class that provides read and write operations for a specific Prisma model.
 */
export class RepositoryImpl<T> implements Repository<T> {
  public readonly read: ReadRepository<T>;
  public readonly write: WriteRepository<T>;

  constructor(read: ReadRepository<T>, write: WriteRepository<T>) {
    this.read = read;
    this.write = write;
  }
}
