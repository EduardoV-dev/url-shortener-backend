import { MockInterface } from "@/test/mocks";

import { ReadRepository, WriteRepository } from "../repositories";

/**
 * Mock type for ReadRepository interface.
 * This type is used to create a mock implementation of the ReadRepository interface for testing purposes.
 * It allows for mocking the methods of the ReadRepository interface using Jest.
 */
export type MockReadRepository<T> = MockInterface<ReadRepository<T>>;

/**
 * MockWriteRepository is a mock version of WriteRepository for testing purposes.
 * It uses jest.Mock to mock the methods of WriteRepository.
 * This allows for easy testing of services that depend on WriteRepository.
 */
export type MockWriteRepository<T> = MockInterface<WriteRepository<T>>;

/**
 * MockRepository is a mock version of Repository for testing purposes.
 * It uses jest.Mock to mock the methods of ReadRepository and WriteRepository.
 * This allows for easy testing of services that depend on Repository.
 */
export interface MockRepository<T> {
  read: MockReadRepository<T>;
  write: MockWriteRepository<T>;
}

export const createMockRepository = <T>(): MockRepository<T> => ({
  read: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    setSelect: jest.fn().mockReturnThis(),
    setWhere: jest.fn().mockReturnThis(),
  },
  write: {
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
});
