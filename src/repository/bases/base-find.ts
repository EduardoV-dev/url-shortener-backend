import { Model, PrismaModel, Where } from "./prisma-model";

export type SortOrder = "asc" | "desc";
export type Nullable<T> = T | null;
export type Select<T> = Partial<Record<keyof T, boolean>>;
export type OrderBy<T> = Partial<Record<keyof T, SortOrder>>;

export interface BaseFind<T> {
  setSelect(select: Select<T>): this;
  setWhere(where: Where<T>): this;
}

export abstract class BaseFindImpl<T> extends PrismaModel implements BaseFind<T> {
  protected where: Nullable<Where<T>>;
  protected select: Nullable<Select<T>>;

  constructor(model: Model) {
    super(model);

    this.where = null;
    this.select = null;
  }

  public setWhere(where: Where<T>): this {
    this.where = where;
    return this;
  }

  public setSelect(select: Select<T>): this {
    this.select = select;
    return this;
  }
}
