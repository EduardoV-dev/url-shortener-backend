import { Model, PrismaModel, Where } from "../bases/prisma-model";

export interface UpdateMethod<T> {
  /**
   * Updates an existing record in the database.
   * @param data - The data to update the record with.
   * @param where - The criteria to find the record to update.
   * @returns A promise that resolves to the updated record.
   */
  update(data: Partial<T>, where: Where<T>): Promise<T>;
}

export class UpdateMethodImpl<T> extends PrismaModel implements UpdateMethod<T> {
  constructor(model: Model) {
    super(model);
  }

  public update: UpdateMethod<T>["update"] = (data, where) => this.model.update({ data, where });
}
