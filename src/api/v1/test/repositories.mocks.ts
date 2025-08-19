import { Repository } from "@/repository";
import { FindAll } from "@/repository/methods/find-all";
import { FindOne } from "@/repository/methods/find-one";
import { MockInterface } from "@/test/mocks";

export type MockFindAll<T> = MockInterface<FindAll<T>>;
export type MockFindOne<T> = MockInterface<FindOne<T>>;
export type MockRepository<T> = MockInterface<Repository<T>>;

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

export const createMockRepository = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn().mockReturnValue(findAllMock<T>()),
  findOne: jest.fn().mockReturnValue(findOneMock<T>()),
  update: jest.fn(),
});
