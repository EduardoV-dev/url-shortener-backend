import { ModelName, Where } from "../base-repository";
import { BaseFind, BaseFindImpl } from "./base-find";
import { Nullable, OrderBy, Select, SortOrder } from "./index";

interface FindAllArgs<T> {
  orderBy?: Nullable<OrderBy<T>>;
  select?: Nullable<Select<T>>;
  skip?: number;
  take?: number;
  where?: Nullable<Where<T>>;
}

export interface FindAll<T> extends BaseFind<T> {
  /**
   * Executes the find operation to retrieve all records.
   * @returns A promise that resolves to a PaginationResponse containing the records and pagination metadata.
   * @remarks This method retrieves all records based on the specified criteria, including pagination and sorting.
   * If pagination is enabled, it returns a PaginationResponse with the data and metadata about the pagination.
   * If pagination is not enabled, it returns a simple array of records.
   */
  execute(): Promise<PaginationResponse<T>>;
  /**
   * Sets the order by criteria for the find operation.
   * @param orderBy - An object defining the fields and their sort order (asc/desc).
   * @returns The current instance for method chaining.
   * @remarks This method allows you to specify how the results should be sorted.
   */
  setOrderBy(orderBy: OrderBy<T>): this;
  /**
   * Sets the select criteria for the find operation.
   * @param select - An object defining which fields to include in the results.
   * @returns The current instance for method chaining.
   * @remarks This method allows you to specify which fields should be returned in the results.
   */
  setPaginated(): this;
  /**
   * Sets page for the find operation.
   * @param page - The current page number to retrieve.
   * @returns The current instance for method chaining.
   * @remarks This method allows you to specify which page of results to retrieve, useful for pagination.
   * @throws Error if the page number is negative.
   */
  setPage(page: number): this;
  /**
   * Sets the number of records to return per page.
   * @param pageSize - The number of records to return per page.
   * @returns The current instance for method chaining.
   * @remarks This method allows you to specify how many records should be returned in each page of results.
   * @throws Error if the page size is not a positive integer and greater than 0.
   */
  setPageSize(pageSize: number): this;
}

export class FindAllImpl<T> extends BaseFindImpl<T> implements FindAll<T> {
  protected orderBy: Nullable<OrderBy<T>>;
  protected paginated: boolean;
  protected page: number;
  protected pageSize: number;

  constructor(modelName: ModelName) {
    super(modelName);

    this.orderBy = null;
    this.page = DEFAULTS_FIND_ALL.PAGE;
    this.pageSize = DEFAULTS_FIND_ALL.PAGE_SIZE;
    this.paginated = false;
  }

  public setPaginated(): this {
    this.paginated = true;
    return this;
  }

  public setPage(page: number): this {
    this.onPaginationConfig();
    if (page < 0) throw new Error("Page must be a non-negative integer");

    this.page = page;
    return this;
  }

  public setPageSize(pageSize: number): this {
    this.onPaginationConfig();

    if (pageSize <= 0) throw new Error("Page size must be a positive integer and greater than 0");

    this.pageSize = pageSize;
    return this;
  }

  public setOrderBy(orderBy: OrderBy<T>): this {
    this.orderBy = orderBy;
    return this;
  }

  public execute: FindAll<T>["execute"] = async () => {
    const response = this.paginated
      ? await this.findAllPaginatedResults()
      : await this.findAllResults();

    this.clearFindArgs();
    return response;
  };

  private findAllResults = async (): Promise<PaginationResponse<T>> => {
    const results = await this.modelDelegate.findMany(this.findArgs);

    return {
      results,
      meta: null,
    };
  };

  private findAllPaginatedResults = async (): Promise<PaginationResponse<T>> => {
    const [results, count] = await Promise.all<[T[], number]>([
      this.modelDelegate.findMany({ ...this.findArgs }),
      this.modelDelegate.count({
        ...(this.findArgs.where && { where: this.findArgs.where }),
      }),
    ]);

    return {
      results,
      meta: {
        totalItems: count,
        page: this.page,
        pageSize: this.pageSize,
        totalPages: Math.ceil(count / this.pageSize),
        hasPrevPage: this.page > 1,
        hasNextPage: this.page * this.pageSize < count,
      },
    };
  };

  private clearFindArgs(): void {
    this.orderBy = null;
    this.page = DEFAULTS_FIND_ALL.PAGE;
    this.pageSize = DEFAULTS_FIND_ALL.PAGE_SIZE;
    this.paginated = false;
    this.select = null;
    this.where = null;
  }

  private get findArgs(): FindAllArgs<T> {
    return {
      ...(this.orderBy && { orderBy: this.orderBy }),
      ...(this.select && { select: this.select }),
      ...(this.where && { where: this.where }),
      ...(this.paginated && {
        skip: (this.page - 1) * this.pageSize,
        take: this.pageSize,
      }),
    };
  }

  private onPaginationConfig() {
    if (!this.paginated)
      throw new Error("Pagination is not set. Use setPaginated() to enable pagination.");
  }
}

export const DEFAULTS_FIND_ALL = Object.freeze({
  PAGE: 1,
  PAGE_SIZE: 30,
});

export interface PaginationParams {
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
}

export interface PaginationResponseMeta extends PaginationParams {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
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

export interface PaginationQueryParams extends Partial<Record<keyof PaginationParams, string>> {
  sortBy?: string;
  sortOrder?: SortOrder;
}
