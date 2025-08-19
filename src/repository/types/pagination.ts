import { FindAllParamsNoOrderBy } from "./find-all";

export interface PaginationResponseMeta extends FindAllParamsNoOrderBy {
  /**
   * Indicates if there is a next page of results.
   * @remarks This is true if there are more records available beyond the current page.
   */
  hasNextPage: boolean;
  /**
   * Indicates if there is a previous page of results.
   * @remarks This is true if there are records available before the current page.
   */
  hasPrevPage: boolean;
  /**
   * The total number of items across all pages.
   * @remarks This is the total count of records that match the query, regardless of pagination settings.
   */
  totalItems: number;
  /**
   * The total number of pages available based on the current pagination settings.
   * @remarks This is calculated based on the total number of items and the page size.
   * It helps in determining how many pages of results there are in total.
   */
  totalPages: number;
}

export interface PaginationResponse<T> {
  /**
   * The array of records for the current page.
   * @remarks This contains the actual data returned for the current page of results.
   * It may be an empty array if there are no records for the current page.
   */
  results: T[];
  /**
   * Metadata about the pagination response.
   * @remarks This includes information such as the current page, total items, total pages.
   */
  meta: PaginationResponseMeta | null;
}
