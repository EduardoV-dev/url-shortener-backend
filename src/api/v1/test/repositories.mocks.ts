import { MockInterface } from "@/test/mocks";

import { ReadRepository, WriteRepository } from "../repositories";
import { FindAll } from "../repositories/read-repository/find-all";
import { FindOne } from "../repositories/read-repository/find-one";

export type MockFindAll<T> = MockInterface<FindAll<T>>;
export type MockFindOne<T> = MockInterface<FindOne<T>>;

export interface MockReadRepository<T> extends ReadRepository<T> {
  findAll(): MockFindAll<T>;
  findOne(): MockFindOne<T>;
}

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

const findAllMock = <T>(): MockFindAll<T> => ({
  execute: jest.fn(),
  setWhere: jest.fn().mockReturnThis(),
  setOrderBy: jest.fn().mockReturnThis(),
  setSelect: jest.fn().mockReturnThis(),
  setPage: jest.fn().mockReturnThis(),
  setPageSize: jest.fn().mockReturnThis(),
  setPaginated: jest.fn().mockReturnThis(),
});

const findOneMock = <T>(): MockFindOne<T> => ({
  execute: jest.fn(),
  setWhere: jest.fn().mockReturnThis(),
  setSelect: jest.fn().mockReturnThis(),
});

const readRepositoryMock = <T>(): MockReadRepository<T> => ({
  findAll: jest.fn().mockReturnValue(findAllMock<T>()),
  findOne: jest.fn().mockReturnValue(findOneMock<T>()),
});

export const createMockRepository = <T>(): MockRepository<T> => ({
  read: readRepositoryMock<T>(),
  write: {
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
});
