import { MockReadRepository, ReadRepository } from "./read-repository";
import { MockWriteRepository, WriteRepository } from "./write-repository";

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

/**
 * MockRepository is a mock version of Repository for testing purposes.
 * It uses jest.Mock to mock the methods of ReadRepository and WriteRepository.
 * This allows for easy testing of services that depend on Repository.
 */
export interface MockRepository {
  read: MockReadRepository;
  write: MockWriteRepository;
}
