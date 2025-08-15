import { ModelName } from "../base-repository";
import { BaseFind, BaseFindImpl } from "./base-find";

export interface FindOne<T> extends BaseFind<T> {
  /**
   * Executes the find operation to retrieve a single record.
   * @returns A promise that resolves to the found record or null if no record matches the criteria.
   * @remarks This method retrieves a single record based on the specified criteria.
   * If no record matches the criteria, it returns null.
   * It is typically used when you expect only one record to match the given conditions.
   */
  execute(): Promise<T | null>;
}

export class FindOneImpl<T> extends BaseFindImpl<T> implements FindOne<T> {
  constructor(modelName: ModelName) {
    super(modelName);
  }

  private get findOneArgs() {
    if (!this.where) throw new Error("Where condition is required for findOne operation");

    return {
      ...(this.where && { where: this.where }),
      ...(this.select && { select: this.select }),
    };
  }

  private clearConfig() {
    this.where = null;
    this.select = null;
  }

  public execute: FindOne<T>["execute"] = () => {
    const response = this.modelDelegate.findUnique(this.findOneArgs);
    this.clearConfig();
    return response;
  };
}
