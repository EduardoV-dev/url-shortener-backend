import { Model, PrismaModel, Where } from "../bases/prisma-model";

export interface DeleteMethod<T> {
  /**
   * Deletes a record from the database.
   * @param where - The criteria to find the record to delete.
   * @returns A promise that resolves to the deleted record.
   */
  delete(where: Where<T>): Promise<T>;
}

export class DeleteMethodImpl<T> extends PrismaModel implements DeleteMethod<T> {
  constructor(model: Model) {
    super(model);
  }

  public delete: DeleteMethod<T>["delete"] = (where) => this.model.delete({ where });
}
