import { ApiError } from "@/utils/api-error";

import { OrderBy } from "../bases/base-find";
import { FindAll } from "../methods/find-all";
import { FindAllParams, FindAllParamsNoOrderBy, FindAllQueryParams } from "../types/find-all";

export const FIND_ALL_DEFAULTS: Readonly<FindAllParamsNoOrderBy> = {
  page: 1,
  pageSize: 30,
};

export const ERROR_CODES = {
  PAGE: {
    NOT_A_NUMBER: "PAGE_NOT_A_NUMBER",
    NOT_GREATER_THAN_ZERO: "PAGE_NOT_GREATER_THAN_ZERO",
  },
  PAGE_SIZE: {
    NOT_A_NUMBER: "PAGE_SIZE_NOT_A_NUMBER",
    NOT_GREATER_THAN_ZERO: "PAGE_SIZE_NOT_GREATER_THAN_ZERO",
  },
  SORT_BY: {
    NOT_A_STRING: "SORT_BY_NOT_A_STRING",
  },
  SORT_ORDER: {
    INVALID: "SORT_ORDER_INVALID",
    BOTH_REQUIRED: "SORT_ORDER_BOTH_REQUIRED",
  },
};

/**
 * Converts query parameters to pagination parameters.
 * @param page - The current page number.
 * @param pageSize - The number of records to return per page.
 * @param sortBy - The field to sort by.
 * @param sortOrder - The order of sorting (asc/desc).
 * @returns An object containing pagination parameters.
 * @throws Error if validation fails on any of the parameters.
 */
export const parseFindAllQueryParams = <T>({
  page,
  pageSize,
  sortBy,
  sortOrder,
}: FindAllQueryParams): FindAllParams<T> => {
  if (page && isNaN(Number(page)))
    throw new ApiError("Page must be a number").setCode(ERROR_CODES.PAGE.NOT_A_NUMBER);

  if (page && Number(page) < 1)
    throw new ApiError("Page must be a positive integer and greater than 0").setCode(
      ERROR_CODES.PAGE.NOT_GREATER_THAN_ZERO,
    );

  if (pageSize && isNaN(Number(pageSize)))
    throw new ApiError("Page size must be a number").setCode(ERROR_CODES.PAGE_SIZE.NOT_A_NUMBER);

  if (pageSize && Number(pageSize) <= 0)
    throw new ApiError("Page size must be a positive integer and greater than 0").setCode(
      ERROR_CODES.PAGE_SIZE.NOT_GREATER_THAN_ZERO,
    );

  if (sortBy && !isNaN(Number(sortBy)))
    throw new ApiError("Sort by must be a string").setCode(ERROR_CODES.SORT_BY.NOT_A_STRING);

  if (sortOrder && !["asc", "desc"].includes(sortOrder))
    throw new ApiError("Sort order must be either 'asc' or 'desc'").setCode(
      ERROR_CODES.SORT_ORDER.INVALID,
    );

  if ((!sortBy && sortOrder) || (sortBy && !sortOrder))
    throw new ApiError(
      "Both Sort by and Sort order must be provided together or not at all",
    ).setCode(ERROR_CODES.SORT_ORDER.BOTH_REQUIRED);

  return {
    orderBy: sortBy && sortOrder ? ({ [sortBy]: sortOrder } as OrderBy<T>) : {},
    page: Number(page || FIND_ALL_DEFAULTS.page),
    pageSize: Number(pageSize || FIND_ALL_DEFAULTS.pageSize),
  };
};

export const executeFindAllWithParams = <T>(params: FindAllQueryParams, findAll: FindAll<T>) => {
  const { orderBy, page, pageSize } = parseFindAllQueryParams<T>(params);
  return findAll.setPaginated().setOrderBy(orderBy).setPage(page).setPageSize(pageSize).execute();
};
