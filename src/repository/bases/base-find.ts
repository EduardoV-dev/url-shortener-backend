import { Model, PrismaModel, Where } from "./prisma-model";

export type Nullable<T> = T | null;
export type Select<T> = Partial<Record<keyof T, boolean>>;
export type OmitInSelect<T> = Select<T>;
export type OrderBy<T> = Partial<Record<keyof T, SortOrder>>;
export type SortOrder = "asc" | "desc";

export interface BaseFind<T> {
  setOmit(omit: OmitInSelect<T>): this;
  setSelect(select: Select<T>): this;
  setWhere(where: Where<T>): this;
}

export interface BaseFindAttributes<T> {
  omit: OmitInSelect<T>;
  select: Nullable<Select<T>>;
  where: Where<T>;
}

export abstract class BaseFindImpl<T> extends PrismaModel implements BaseFind<T> {
  protected where: Where<T>;
  protected select: Nullable<Select<T>>;
  protected omit: OmitInSelect<T>;

  constructor(model: Model) {
    super(model);

    this.omit = { isDeleted: true } as OmitInSelect<T>;
    this.select = null;
    this.where = { isDeleted: false } as T;
  }

  public setWhere(where: Where<T>): this {
    this.where = { ...this.where, ...where };
    return this;
  }

  public setSelect(select: Select<T>): this {
    this.select = select;
    return this;
  }

  public setOmit(omit: OmitInSelect<T>): this {
    this.omit = { ...this.omit, ...omit };
    return this;
  }

  protected resetBaseFindAttributes() {
    this.where = { isDeleted: false } as T;
    this.select = null;
    this.omit = { isDeleted: true } as OmitInSelect<T>;
  }
}
