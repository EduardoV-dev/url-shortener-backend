import { BaseRepositoryImpl, ModelName, Select, Where } from "./base-repository";

export interface ReadRepository<T> {
  /**
   * Finds all records matching the criteria.
   * @returns A promise that resolves to an array of records.
   */
  findAll(): Promise<T[]>;
  /**
   * Finds a single record matching the criteria.
   * @returns A promise that resolves to the record or null if not found.
   */
  findOne(): Promise<T | null>;
  /**
   * Sets the where clause for filtering records.
   * @param where - The criteria to filter records.
   * @returns The current instance for method chaining.
   */
  setWhere(where: Where<T>): this;
  /**
   * Sets the select clause for selecting specific fields.
   * @param select - The fields to select.
   * @returns The current instance for method chaining.
   */
  setSelect(select: Select<T>): this;
}

type Nullable<T> = T | null;

/**
 * A generic repository implementation for read operations using Prisma ORM.
 * Provides methods to find all records or a single record based on criteria.
 */
export class ReadRepositoryImpl<T> extends BaseRepositoryImpl implements ReadRepository<T> {
  protected where: Nullable<Where<T>>;
  protected select: Nullable<Select<T>>;

  constructor(modelName: ModelName) {
    super(modelName);

    this.where = null;
    this.select = null;
  }

  // === Setters / Builder ===

  public setWhere(where: Where<T>): this {
    this.where = where;
    return this;
  }

  public setSelect(select: Select<T>): this {
    this.select = select;
    return this;
  }

  // === Support Methods ===

  private clearConfig(): this {
    this.where = null;
    this.select = null;
    return this;
  }

  private get findAllArgs() {
    const config = {};

    if (this.where) Object.assign(config, { where: this.where });
    if (this.select) Object.assign(config, { select: this.select });

    return config;
  }

  private get findOneArgs() {
    const config = {};

    if (this.where) Object.assign(config, { where: this.where });
    else throw new Error("Where clause is required for findOne");

    if (this.select) Object.assign(config, { select: this.select });

    return config;
  }

  // === Methods ===

  public findAll: ReadRepository<T>["findAll"] = async () => {
    const result = await this.modelDelegate.findMany(this.findAllArgs);
    this.clearConfig();
    return result;
  };

  public findOne: ReadRepository<T>["findOne"] = async () => {
    const result = await this.modelDelegate.findUnique(this.findOneArgs);
    this.clearConfig();
    return result;
  };
}

/**
 * Mock type for ReadRepository interface.
 * This type is used to create a mock implementation of the ReadRepository interface for testing purposes.
 * It allows for mocking the methods of the ReadRepository interface using Jest.
 */
export type MockReadRepository = {
  [K in keyof ReadRepository<unknown>]: jest.Mock;
};
