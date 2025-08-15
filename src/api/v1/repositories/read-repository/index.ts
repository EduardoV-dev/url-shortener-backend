import { BaseRepositoryImpl, ModelName } from "../base-repository";
import { FindAll, FindAllImpl } from "./find-all";
import { FindOne, FindOneImpl } from "./find-one";

export type SortOrder = "asc" | "desc";
export type Nullable<T> = T | null;
export type Select<T> = Partial<Record<keyof T, boolean>>;
export type OrderBy<T> = Partial<Record<keyof T, SortOrder>>;

export interface ReadRepository<T> {
  findAll(): FindAll<T>;
  findOne(): FindOne<T>;
}

/**
 * A generic repository implementation for read operations using Prisma ORM.
 * Provides methods to find all records or a single record based on criteria.
 */
export class ReadRepositoryImpl<T> extends BaseRepositoryImpl implements ReadRepository<T> {
  public findAll: ReadRepository<T>["findAll"];
  public findOne: ReadRepository<T>["findOne"];

  constructor(modelName: ModelName) {
    super(modelName);

    this.findAll = () => new FindAllImpl<T>(this.modelName);
    this.findOne = () => new FindOneImpl<T>(this.modelName);
  }
}

export {
  PaginationParams,
  PaginationQueryParams,
  PaginationResponse,
  PaginationResponseMeta,
} from "./find-all";
