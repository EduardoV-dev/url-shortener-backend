import { PrismaClient } from "@/generated/prisma";

import { BaseRepositoryImpl, Where } from "./base-repository";

export interface WriteRepository<T> {
  create(data: Partial<T>): Promise<T>;
  update(data: Partial<T>, where: Where<T>): Promise<T>;
  delete(where: Where<T>): Promise<T>;
}

export class WriteRepositoryImpl<T> extends BaseRepositoryImpl implements WriteRepository<T> {
  constructor(protected modelName: keyof PrismaClient) {
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
