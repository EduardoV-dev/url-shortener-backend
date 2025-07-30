import { HTTP_STATUS } from "@/config/common";
import { prismaMock } from "@/test/prisma-mock";

import { UrlCreateParams, UrlShortenerRepository } from "../repository";
import { MOCK_URL } from "./mocks";

describe("UrlShortenerRepository", () => {
  let repo: UrlShortenerRepository;

  beforeEach(() => {
    repo = new UrlShortenerRepository();
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

    it("Should throw an error if url could not be created", async () => {
      prismaMock.url.create.mockRejectedValue(new Error("Database error"));

      const response = repo.create(createParams);
      await expect(response).rejects.toHaveProperty(
        "statusCode",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
    });
  });
});
