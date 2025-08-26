import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { FindAll, FindAllImpl } from "@/repository/methods/find-all";
import { FindAllQueryParams } from "@/repository/types/find-all";
import { prismaMock } from "@/test/__mocks__/prisma";
import { ApiError } from "@/utils/api-error";

import {
  executeFindAllWithParams,
  FIND_ALL_DEFAULTS,
  parseFindAllQueryParams,
} from "../pagination";

describe("Pagination utils", () => {
  let findAll: FindAll<Url>;

  beforeEach(() => {
    findAll = new FindAllImpl<Url>(prismaMock.url);
  });

  describe("parseFindAllQueryParams", () => {
    describe("Validations", () => {
      it("Throws an error if page is not a number", async () => {
        onValidationError({ page: "not-a-number" as never });
      });

      it("Throws an error if page is not greater than zero", async () => {
        onValidationError({ page: -1 });
      });

      it("Throws an error if pageSize is not a number", async () => {
        onValidationError({ pageSize: "not-a-number" as never });
      });

      it("Throws an error if pageSize is not greater than zero", async () => {
        onValidationError({ pageSize: -1 });
      });

      it("Throws an error if sortBy is not a string", async () => {
        onValidationError({ sortBy: "0" as never });
      });

      it("Throws an error if sortOrder is not valid", async () => {
        onValidationError({ sortOrder: "c" });
      });

      it("Throws an error if sortBy is not provided but sortOrder is not", async () => {
        onValidationError({ sortOrder: "asc" });
      });

      it("Throws an error if sortOrder is provided but sortBy is not", async () => {
        onValidationError({ sortBy: "createdAt" });
      });
    });

    it("Should return default values if no parameters are provided", () => {
      const result = parseFindAllQueryParams<Url>({});
      expect(result).toEqual({
        page: FIND_ALL_DEFAULTS.page,
        pageSize: FIND_ALL_DEFAULTS.pageSize,
        orderBy: {},
      });
    });

    it("should define orderBy if sortBy and sortOrder are provided", () => {
      const result = parseFindAllQueryParams<Url>({ sortBy: "createdAt", sortOrder: "asc" });
      expect(result.orderBy).toEqual({ createdAt: "asc" });
    });
  });

  describe("executeFindAllWithParams", () => {
    const totalItems = 100;

    beforeEach(() => {
      prismaMock.url.findMany.mockResolvedValue(
        new Array(totalItems).fill({
          id: "url1",
          longUrl: "http://example.com",
          shortId: "exmpl",
          userId: "user1",
          createdAt: new Date(),
        }),
      );

      prismaMock.url.count.mockResolvedValue(totalItems);
    });

    it("executes with the default params", async () => {
      const params: FindAllQueryParams = {};
      const result = await executeFindAllWithParams<Url>(params, findAll);

      expect(result.meta).toEqual(
        expect.objectContaining({
          page: FIND_ALL_DEFAULTS.page,
          pageSize: FIND_ALL_DEFAULTS.pageSize,
          totalItems,
        }),
      );
    });

    it("Executes with custom page and pageSize", async () => {
      const params: FindAllQueryParams = { page: 2, pageSize: 20 };
      const result = await executeFindAllWithParams<Url>(params, findAll);

      expect(result.meta).toEqual(
        expect.objectContaining({
          page: params.page,
          pageSize: params.pageSize,
          totalItems,
        }),
      );
    });
  });

  const onValidationError = async (params: FindAllQueryParams) => {
    try {
      parseFindAllQueryParams<Url>(params);
    } catch (error) {
      expect((error as ApiError).status).toBe(HTTP_STATUS.BAD_REQUEST);
    }
  };
});
