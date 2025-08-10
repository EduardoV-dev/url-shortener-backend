import { BaseRepositoryImpl, ModelName, Where } from "./base-repository";

export interface WriteRepository<T> {
  /**
   * Creates a new record in the database.
   * @param data - The data to create the record with.
   * @returns A promise that resolves to the created record.
   */
  create(data: Partial<T>): Promise<T>;
  /**
   * Updates an existing record in the database.
   * @param data - The data to update the record with.
   * @param where - The criteria to find the record to update.
   * @returns A promise that resolves to the updated record.
   */
  update(data: Partial<T>, where: Where<T>): Promise<T>;
  /**
   * Deletes a record from the database.
   * @param where - The criteria to find the record to delete.
   * @returns A promise that resolves to the deleted record.
   */
  delete(where: Where<T>): Promise<T>;
}

export class WriteRepositoryImpl<T> extends BaseRepositoryImpl implements WriteRepository<T> {
  constructor(modelName: ModelName) {
    super(modelName);
  }

  public create: WriteRepository<T>["create"] = (data) => {
    return this.modelDelegate.create({ data });
  };

  public update: WriteRepository<T>["update"] = (data, where) => {
    return this.modelDelegate.update({ where, data });
  };

  public delete: WriteRepository<T>["delete"] = (where) => {
    return this.modelDelegate.delete({ where });
  };
}
