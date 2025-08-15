import { MOCK_URLS } from "@/api/v1/test/links.mocks";
import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { Where } from "../../base-repository";
import { OrderBy, Select } from "../../read-repository";
import {
  DEFAULTS_FIND_ALL,
  FindAll,
  FindAllImpl,
  PaginationResponseMeta,
} from "../../read-repository/find-all";

describe("ReadRepository | FindAll", () => {
  let findAll: FindAll<Url>;

  beforeEach(() => {
    findAll = new FindAllImpl<Url>("url");
  });

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
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({});
    });

    it("Should return all records using select, sort by and where clause", async () => {
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
      const select: Select<Url> = { createdAt: true, id: true, longUrl: true };
      const where: Where<Url> = { userId: "user1" };

      prismaMock.url.findMany.mockResolvedValue(results as Url[]);

      const response = await findAll
        .setOrderBy(orderBy)
        .setSelect(select)
        .setWhere(where)
        .execute();

      expect(response.results).toEqual(results);
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, id: true, longUrl: true },
        where: { userId: "user1" },
      });
    });
  });

  describe("With pagination", () => {
    const mockUrls = new Array(100).fill(MOCK_URLS).flat();

    beforeEach(() => {
      prismaMock.url.count.mockResolvedValue(mockUrls.length);
    });

    // TODO: Improve the error test to handle an specific error, make ApiError to contain code again to do this
    describe("setPage", () => {
      it("Should throw an error if pageSize is below 0", async () => {
        try {
          await findAll.setPaginated().setPage(-1).execute();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      it("Should throw an error if pagination is not enabled", async () => {
        try {
          await findAll.setPage(1).execute();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    describe("setPageSize", () => {
      it("Should throw an error if pageSize is below 0", async () => {
        try {
          await findAll.setPaginated().setPageSize(-1).execute();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      it("Should throw an error if pagination is not enabled", async () => {
        try {
          await findAll.setPageSize(10).execute();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it("Should return paginated results with meta data (default page, pageSize)", async () => {
      const results = mockUrls.slice(
        (DEFAULTS_FIND_ALL.PAGE - 1) * DEFAULTS_FIND_ALL.PAGE,
        DEFAULTS_FIND_ALL.PAGE_SIZE,
      );
      prismaMock.url.findMany.mockResolvedValue(results);
      const response = await findAll.setPaginated().execute();

      expect(response.meta).toEqual({
        totalItems: mockUrls.length,
        page: 1,
        pageSize: DEFAULTS_FIND_ALL.PAGE_SIZE,
        totalPages: Math.ceil(mockUrls.length / DEFAULTS_FIND_ALL.PAGE_SIZE),
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
});
