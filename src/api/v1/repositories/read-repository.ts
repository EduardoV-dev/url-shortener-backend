import { PrismaClient } from "@/generated/prisma";

import { BaseRepositoryImpl, Select, Where } from "./base-repository";

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
}

type Nullable<T> = T | null;

/**
 * A generic repository implementation for read operations using Prisma ORM.
 * Provides methods to find all records or a single record based on criteria.
 */
export class ReadRepositoryImpl<T> extends BaseRepositoryImpl implements ReadRepository<T> {
  protected where: Nullable<Where<T>>;
  protected select: Nullable<Select<T>>;

  constructor(protected modelName: keyof PrismaClient) {
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
