import { BaseRepositoryImpl, ModelName, Where } from "../base-repository";
import { Nullable, Select } from "./index";

export interface BaseFind<T> {
  setSelect(select: Select<T>): this;
  setWhere(where: Where<T>): this;
}

export abstract class BaseFindImpl<T> extends BaseRepositoryImpl implements BaseFind<T> {
  protected where: Nullable<Where<T>>;
  protected select: Nullable<Select<T>>;

  constructor(modelName: ModelName) {
    super(modelName);

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
