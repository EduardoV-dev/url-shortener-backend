import { OrderBy } from "../bases/base-find";

export interface FindAllParams<T> {
  /**
   * The current page number for pagination.
   * @remarks This is used to determine which set of records to return based on the page size.
   */
  page: number;
  /**
   * The number of records to return per page.
   * @remarks This is used to limit the number of records returned in a single response.
   */
  pageSize: number;
  /**
   * The order by criteria for sorting the results.
   * @remarks This is an object where keys are field names and values are the sort order (asc/desc).
   * It allows for flexible sorting of the results based on one or more fields.
   */
  orderBy: OrderBy<T>;
}

export type FindAllParamsNoOrderBy = Omit<FindAllParams<unknown>, "orderBy">;

/**
 * Query parameters for pagination, including sorting options.
 * @remarks This interface extends the PaginationParams to include optional sorting parameters.
 * It allows for flexible querying of paginated results with sorting capabilities.
 */
export interface FindAllQueryParams extends Partial<FindAllParamsNoOrderBy> {
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Combines pagination parameters with additional query parameters.
 * @remarks This type extends PaginationQueryParams to include any additional parameters needed for specific queries.
 * It allows for more complex queries that require both pagination and additional filtering or sorting options.
 */
export type WithFindAllQueryParams<T> = FindAllQueryParams & T;
