import { ApiError } from "@/utils/api-error";

import { BaseFind, BaseFindImpl } from "../bases/base-find";
import { Model } from "../bases/prisma-model";

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

export const FIND_ONE_ERROR_CODES = {
  VALIDATION: "FIND_ONE_VALIDATION_ERROR",
};

export class FindOneImpl<T> extends BaseFindImpl<T> implements FindOne<T> {
  constructor(model: Model) {
    super(model);
  }

  private get findOneArgs() {
    const whereKeys = Object.keys(this.where);
    const hasOnlyIsDeleted = whereKeys.length === 1 && whereKeys.includes("isDeleted");

    if (hasOnlyIsDeleted)
      throw new ApiError("Where condition is required for findOne operation", {
        code: FIND_ONE_ERROR_CODES.VALIDATION,
      });

    return {
      omit: this.omit,
      where: this.where,
      ...(this.select && { select: this.select }),
    };
  }

  public execute: FindOne<T>["execute"] = () => {
    const response = this.model.findUnique(this.findOneArgs);
    this.resetBaseFindAttributes();
    return response;
  };
}
