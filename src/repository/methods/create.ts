import { Model, PrismaModel } from "../bases/prisma-model";

export interface CreateMethod<T> {
  /**
   * Creates a new record in the database.
   * @param data - The data to create the record with.
   * @returns A promise that resolves to the created record.
   * @remarks This method is used to insert a new record into the database.
   */
  create(data: Partial<T>): Promise<T>;
}

export class CreateMethodImpl<T> extends PrismaModel implements CreateMethod<T> {
  constructor(model: Model) {
    super(model);
  }

  public create: CreateMethod<T>["create"] = (data) => this.model.create({ data });
}
