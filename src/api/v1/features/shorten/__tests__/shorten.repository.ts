import { PRISMA_CODES } from "@/constants/common";
import { Prisma } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { SHORTEN_ERROR_CODES, ShortenRepositoryImpl, UrlCreateParams } from "../shorten.repository";
import { MOCK_URL } from "./mocks";

describe("UrlShortenerRepository", () => {
  let repo: ShortenRepositoryImpl;

  beforeEach(() => {
    repo = new ShortenRepositoryImpl();
  });

  describe("create", () => {
    const createParams: UrlCreateParams = {
      shortId: MOCK_URL.shortId,
      longUrl: MOCK_URL.longUrl,
    };

    it("Should create a new url", async () => {
      prismaMock.url.create.mockResolvedValue(MOCK_URL);
      const response = await repo.create(createParams);

      expect(prismaMock.url.create).toHaveBeenCalledWith({
        data: createParams,
      });
      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
      expect(response).toEqual(MOCK_URL);
    });

    it("Should throw an error if shortId already exists", async () => {
      prismaMock.url.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("", {
          code: PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED,
          clientVersion: "",
        }),
      );

      await expect(repo.create(createParams)).rejects.toHaveProperty(
        "code",
        SHORTEN_ERROR_CODES.CREATE.SHORT_ID_ALREADY_EXISTS,
      );

      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
    });

    it("Should throw an Internal Server Error if url could not be created", async () => {
      prismaMock.url.create.mockRejectedValue(new Error("Database error"));

      const response = repo.create(createParams);
      await expect(response).rejects.toHaveProperty(
        "code",
        SHORTEN_ERROR_CODES.CREATE.INTERNAL_SERVER_ERROR,
      );
      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
    });
  });
});
