import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { ReadRepositoryImpl } from "../read-repository";

describe("ReadRepository", () => {
  let repo: ReadRepositoryImpl<Url>;

  const mockUrls: Url[] = [
    {
      id: "1",
      longUrl: "https://example.com/1",
      createdAt: new Date(),
      shortId: "fdsaf",
      userId: "user1",
    },
    {
      id: "2",
      longUrl: "https://example.com/2",
      createdAt: new Date(),
      shortId: "sdfdsf",
      userId: "user2",
    },
    {
      id: "3",
      longUrl: "https://example.com/3",
      createdAt: new Date(),
      shortId: "sdfdsfa",
      userId: "user3",
    },
  ];

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
      prismaMock.url.findMany.mockResolvedValue(mockUrls);

      const result = await repo.findAll();
      expect(result).toEqual(mockUrls);
    });

    it("Returns records with select fields", async () => {
      const mockUrlsWithSelect = mockUrls.map(({ id, longUrl }) => ({ id, longUrl }));
      prismaMock.url.findMany.mockResolvedValue(mockUrlsWithSelect as Url[]);
      const result = await repo.setSelect({ id: true, longUrl: true }).findAll();
      expect(result).toEqual(mockUrlsWithSelect);
    });

    it("findAll returns records with where clause", async () => {
      const mockUrlsWithWhere = mockUrls.filter((url) => url.userId === "user1");
      prismaMock.url.findMany.mockResolvedValue(mockUrlsWithWhere);
      const result = await repo.setWhere({ userId: "user1" }).findAll();
      expect(result).toEqual(mockUrlsWithWhere);
    });
  });

  describe("findOne", () => {
    it("Finds a single record with findOne", async () => {
      prismaMock.url.findUnique.mockResolvedValue(mockUrls[0]);
      const result = await repo.setWhere({ id: "1" }).findOne();
      expect(result).toEqual(mockUrls[0]);
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
