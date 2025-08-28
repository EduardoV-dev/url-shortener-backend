import { Url } from "@/generated/prisma";
import { FIND_ALL_DEFAULTS, OrderBy, PaginationResponseMeta, Select } from "@/repository";
import { MOCK_URLS } from "@/test/__fixtures__/url";
import { prismaMock } from "@/test/__mocks__/prisma";
import { ApiError } from "@/utils/api-error";

import { Where } from "../../bases/prisma-model";
import { FIND_ALL_ERROR_CODES, FindAll, FindAllImpl } from "../../methods/find-all";

describe("Methods | FindAll", () => {
  let findAll: FindAll<Url>;

  beforeEach(() => {
    findAll = new FindAllImpl<Url>(prismaMock.url);
  });

  const onValidationError = (error: unknown) => {
    const err = error as ApiError;
    expect(err.code).toBe(FIND_ALL_ERROR_CODES.VALIDATION);
  };

  describe("Without pagination", () => {
    it("Should not return meta data when pagination is not enabled", async () => {
      prismaMock.url.findMany.mockResolvedValue(MOCK_URLS);
      const response = await findAll.execute();
      expect(response.meta).toBeNull();
    });

    it("should return all records with select all, not sort by, and no where clause (defaults)", async () => {
      prismaMock.url.findMany.mockResolvedValue(MOCK_URLS);
      const response = await findAll.execute();

      expect(response.results).toEqual(MOCK_URLS);
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        omit: { isDeleted: true },
      });
    });

    it("Should return all records using select, sort by, omit, and where clause", async () => {
      const results = new Array(MOCK_URLS.length * 3)
        .fill(MOCK_URLS)
        .flat()
        .filter((url: Url) => url.userId === "user1")
        .map((url: Url) => ({
          createdAt: new Date(url.createdAt.getTime() + Math.random() * 1000),
          id: url.id,
          longUrl: url.longUrl,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const orderBy: OrderBy<Url> = { createdAt: "desc" };
      const select: Select<Url> = { createdAt: true, id: true, longUrl: true, isDeleted: true };
      const where: Where<Url> = { userId: "user1" };

      prismaMock.url.findMany.mockResolvedValue(results as Url[]);

      const response = await findAll
        .setOrderBy(orderBy)
        .setSelect(select)
        .setWhere(where)
        .execute();

      expect(response.results).toEqual(results);
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        omit: { isDeleted: true },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, id: true, longUrl: true, isDeleted: true },
        where: { userId: "user1", isDeleted: false },
      });
    });
  });

  describe("With pagination", () => {
    const mockUrls = new Array(100).fill(MOCK_URLS).flat();

    beforeEach(() => {
      prismaMock.url.count.mockResolvedValue(mockUrls.length);
    });

    describe("setPage", () => {
      it("Should throw an error if page is below 0", async () => {
        try {
          await findAll.setPaginated().setPage(-1).execute();
        } catch (err) {
          onValidationError(err);
        }
      });

      it("Should throw an error if pagination is not enabled", async () => {
        try {
          await findAll.setPage(1).execute();
        } catch (error) {
          onValidationError(error);
        }
      });
    });

    describe("setPageSize", () => {
      it("Should throw an error if pageSize is below 0", async () => {
        try {
          await findAll.setPaginated().setPageSize(-1).execute();
        } catch (error) {
          onValidationError(error);
        }
      });

      it("Should throw an error if pagination is not enabled", async () => {
        try {
          await findAll.setPageSize(10).execute();
        } catch (error) {
          onValidationError(error);
        }
      });
    });

    it("Gets different results count based on where clause", async () => {
      const results = mockUrls.filter((url: Url) => url.userId === "user1");

      prismaMock.url.findMany.mockResolvedValueOnce(mockUrls).mockResolvedValueOnce(results);
      prismaMock.url.count
        .mockResolvedValueOnce(mockUrls.length)
        .mockResolvedValueOnce(results.length);

      const firstResponse = await findAll.setPaginated().execute();
      const secondResponse = await findAll.setPaginated().setWhere({ userId: "user1" }).execute();

      expect(firstResponse.meta?.totalItems).toBe(mockUrls.length);
      expect(secondResponse.meta?.totalItems).toBe(results.length);
    });

    it("Should return paginated results with meta data (default page, pageSize)", async () => {
      const page = FIND_ALL_DEFAULTS.page;
      const pageSize = FIND_ALL_DEFAULTS.pageSize;

      const results = mockUrls.slice((page - 1) * page, pageSize);
      prismaMock.url.findMany.mockResolvedValue(results);
      const response = await findAll.setPaginated().execute();

      expect(response.meta).toEqual({
        totalItems: mockUrls.length,
        page: 1,
        pageSize: pageSize,
        totalPages: Math.ceil(mockUrls.length / pageSize),
        hasPrevPage: false,
        hasNextPage: true,
      } as PaginationResponseMeta);
      expect(response.results).toEqual(results);
    });

    it("Returns paginated results with meta data (custom page, pageSize)", async () => {
      const page = 2;
      const pageSize = 25;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const results = mockUrls.slice(start, end);

      prismaMock.url.findMany.mockResolvedValue(results);

      const response = await findAll.setPaginated().setPage(page).setPageSize(pageSize).execute();

      expect(response.meta).toEqual({
        totalItems: mockUrls.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockUrls.length / pageSize),
        hasPrevPage: page > 1,
        hasNextPage: page * pageSize < mockUrls.length,
      } as PaginationResponseMeta);
      expect(response.results).toEqual(results);
    });
  });

  it("Throws an error if page exceeds total pages", async () => {
    const page = 6;
    const pageSize = 20;

    // page * pageSize = 6, totalPages would be 5 for 100 items, making this invalid and into the catch block
    prismaMock.url.count.mockResolvedValue(100);

    try {
      await findAll.setPaginated().setPage(page).setPageSize(pageSize).execute();
    } catch (error) {
      onValidationError(error);
    }
  });
});
