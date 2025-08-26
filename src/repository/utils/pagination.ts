import { HTTP_STATUS } from "@/constants/common";
import { ApiError, ApiErrorOptions } from "@/utils/api-error";

import { OrderBy } from "../bases/base-find";
import { FindAll } from "../methods/find-all";
import { FindAllParams, FindAllParamsNoOrderBy, FindAllQueryParams } from "../types/find-all";

export const FIND_ALL_DEFAULTS: Readonly<FindAllParamsNoOrderBy> = {
  page: 1,
  pageSize: 30,
};

const API_ERROR_OPTIONS: ApiErrorOptions = {
  status: HTTP_STATUS.BAD_REQUEST,
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
    throw new ApiError("Page in query param must be a number", API_ERROR_OPTIONS);

  if (page && Number(page) < 1)
    throw new ApiError(
      "Page in query param must be a positive integer and greater than 0",
      API_ERROR_OPTIONS,
    );
  if (pageSize && isNaN(Number(pageSize)))
    throw new ApiError("Page size in query param must be a number", API_ERROR_OPTIONS);

  if (pageSize && Number(pageSize) <= 0)
    throw new ApiError(
      "Page size in query param must be a positive integer and greater than 0",
      API_ERROR_OPTIONS,
    );

  if (sortBy && !isNaN(Number(sortBy)))
    throw new ApiError("Sort by in query param must be a string", API_ERROR_OPTIONS);

  if (sortOrder && !["asc", "desc"].includes(sortOrder))
    throw new ApiError(
      "Sort order in query param must be either 'asc' or 'desc'",
      API_ERROR_OPTIONS,
    );

  if ((!sortBy && sortOrder) || (sortBy && !sortOrder))
    throw new ApiError(
      "Both Sort by and Sort order in query param must be provided together or not at all",
      API_ERROR_OPTIONS,
    );

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
