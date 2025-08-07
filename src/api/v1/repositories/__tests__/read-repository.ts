import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { MOCK_URLS } from "../../test/mocks";
import { ReadRepositoryImpl } from "../read-repository";

describe("ReadRepository", () => {
  let repo: ReadRepositoryImpl<Url>;

  beforeEach(() => {
    repo = new ReadRepositoryImpl<Url>("url");
  });

  it("Initializes with default values", () => {
    expect(repo).toBeDefined();
  });

  describe("findAll", () => {
    it("findAll returns an empty array when no records match", async () => {
      prismaMock.url.findMany.mockResolvedValue([]);
      const result = await repo.findAll();
      expect(result).toEqual([]);
    });

    it("findAll returns records when they exist", async () => {
      prismaMock.url.findMany.mockResolvedValue(MOCK_URLS);

      const result = await repo.findAll();
      expect(result).toEqual(MOCK_URLS);
    });

    it("Returns records with select fields", async () => {
      const mockUrlsWithSelect = MOCK_URLS.map(({ id, longUrl }) => ({ id, longUrl }));
      prismaMock.url.findMany.mockResolvedValue(mockUrlsWithSelect as Url[]);
      const result = await repo.setSelect({ id: true, longUrl: true }).findAll();
      expect(result).toEqual(mockUrlsWithSelect);
    });

    it("findAll returns records with where clause", async () => {
      const mockUrlsWithWhere = MOCK_URLS.filter((url) => url.userId === "user1");
      prismaMock.url.findMany.mockResolvedValue(mockUrlsWithWhere);
      const result = await repo.setWhere({ userId: "user1" }).findAll();
      expect(result).toEqual(mockUrlsWithWhere);
    });
  });

  describe("findOne", () => {
    it("Finds a single record with findOne", async () => {
      prismaMock.url.findUnique.mockResolvedValue(MOCK_URLS[0]);
      const result = await repo.setWhere({ id: "1" }).findOne();
      expect(result).toEqual(MOCK_URLS[0]);
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("Finds a single record with findOne and select fields", async () => {
      const mockUrlWithSelect = { id: "1", longUrl: "https://example.com/1" };
      prismaMock.url.findUnique.mockResolvedValue(mockUrlWithSelect as Url);

      const result = await repo
        .setWhere({ id: "1" })
        .setSelect({ id: true, longUrl: true })
        .findOne();

      expect(result).toEqual(mockUrlWithSelect);
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: { id: true, longUrl: true },
      });
    });

    it("Throws an error when findOne is called without a where clause", async () => {
      prismaMock.url.findUnique.mockResolvedValue(null);
      await expect(repo.findOne()).rejects.toThrow(Error);
      expect(prismaMock.url.findUnique).not.toHaveBeenCalled();
    });
  });
});
