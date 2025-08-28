import { Model, Where } from "../bases/prisma-model";
import { UpdateMethod, UpdateMethodImpl } from "./update";

export interface DeleteMethod<T> {
  /**
   * Deletes a record from the database.
   * @param where - The criteria to find the record to delete.
   * @returns A promise that resolves to the deleted record.
   */
  delete(where: Where<T>): Promise<T>;
}

export class DeleteMethodImpl<T> implements DeleteMethod<T> {
  private updateMethod: UpdateMethod<T>;

  constructor(model: Model) {
    this.updateMethod = new UpdateMethodImpl<T>(model);
  }

  public delete: DeleteMethod<T>["delete"] = (where) =>
    this.updateMethod.update({ isDeleted: true } as T, where);
}
