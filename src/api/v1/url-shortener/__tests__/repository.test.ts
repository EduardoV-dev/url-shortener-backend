import { HTTP_STATUS } from "@/config/http-status";
import { PRISMA_CODES } from "@/constants/prisma-codes";
import { Prisma, Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";
import { HttpError } from "@/utils/http-error";

import { UrlShortenerRepository } from "../repository";
import { mockUrl } from "./mocks";

const PRISMA_RECORD_NOT_FOUND_ERROR = new Prisma.PrismaClientKnownRequestError("Record not found", {
  code: PRISMA_CODES.RECORD_NOT_FOUND,
  clientVersion: "",
});

describe("UrlShortenerRepository", () => {
  let repo: UrlShortenerRepository;

  beforeEach(() => {
    repo = new UrlShortenerRepository();
  });

  describe("create", () => {
    const createParams = {
      originalUrl: mockUrl.originalUrl,
      shortCode: mockUrl.shortCode,
    };

    it("Should create a new url", async () => {
      prismaMock.url.create.mockResolvedValue(mockUrl);
      const response = await repo.create(createParams);

      expect(prismaMock.url.create).toHaveBeenCalledWith({
        data: createParams,
      });
      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
      expect(response).toEqual(mockUrl);
    });

    it("Should throw an error if url could not be created", () => {
      prismaMock.url.create.mockRejectedValue(new Error("Database connection failed"));

      const response = repo.create(createParams);

      expect(response).rejects.toThrow(HttpError);
      expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("get", () => {
    const shortCode = "hello-world";

    it("Should retrieve a existing url register", async () => {
      const url = { ...mockUrl, shortCode };
      prismaMock.url.findFirst.mockResolvedValue(url);

      expect(await repo.get(shortCode)).toEqual(url);
      expect(prismaMock.url.findFirst).toHaveBeenCalledWith({
        where: { shortCode },
      });
      expect(prismaMock.url.findFirst).toHaveBeenCalledTimes(1);
    });

    it("Should retrieve null as user is unexistent", async () => {
      const notExistingShortCode = "not-existing";

      prismaMock.url.findFirst.mockResolvedValue(null);

      expect(await repo.get(notExistingShortCode)).toEqual(null);
      expect(prismaMock.url.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.findFirst).toHaveBeenCalledWith({
        where: { shortCode: notExistingShortCode },
      });
    });

    it("Should return 500 error when trying to retrieve the user", async () => {
      prismaMock.url.findFirst.mockRejectedValue(new Error("Database error"));

      const response = repo.get(shortCode);

      expect(response).rejects.toThrow(HttpError);
      expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(prismaMock.url.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("Should update the url information", async () => {
      const dataToUpdate: Partial<Url> = {
        clickCount: 2,
        originalUrl: "https://new-url.com",
      };

      const shortCode = "code";

      const updatedData: Url = {
        ...mockUrl,
        ...dataToUpdate,
      };

      prismaMock.url.update.mockResolvedValue(updatedData);

      const response = await repo.update(shortCode, dataToUpdate);

      expect(response).toEqual(updatedData);
      expect(prismaMock.url.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        where: {
          shortCode: shortCode,
        },
        data: {
          ...dataToUpdate,
          updatedAt: expect.any(Date),
        },
      });
    });

    it("Should throw an error if no url is found to update", () => {
      prismaMock.url.update.mockRejectedValue(PRISMA_RECORD_NOT_FOUND_ERROR);

      const response = repo.update("non-existing-code", {});
      expect(response).rejects.toThrow(HttpError);
      expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.NOT_FOUND);
      expect(prismaMock.url.update).toHaveBeenCalledTimes(1);
    });

    it("Should return a 500 status code error ", () => {
      prismaMock.url.update.mockRejectedValue(new Error("Could not update"));

      const response = repo.update("any-code", {});

      expect(response).rejects.toThrow(HttpError);
      expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(prismaMock.url.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    it("Should delete a url by short code", async () => {
      const shortCode = "code-to-delete";

      const deletedUrl: Url = {
        id: 4,
        shortCode,
        originalUrl: "https://deleted-url.com",
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.url.delete.mockResolvedValue(deletedUrl);

      const response = await repo.delete(shortCode);

      expect(response).toEqual(deletedUrl);
      expect(prismaMock.url.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.delete).toHaveBeenCalledWith({
        where: { shortCode },
      });
    });

    it("Should throw an error if no url is found to delete", async () => {
      prismaMock.url.delete.mockRejectedValue(PRISMA_RECORD_NOT_FOUND_ERROR);

      const response = repo.delete("non-existing-code");

      expect(response).rejects.toThrow(HttpError);
      expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.NOT_FOUND);
      expect(prismaMock.url.delete).toHaveBeenCalledTimes(1);
    });

    it("Should throw a 500 error if deletion fails", () => {
      prismaMock.url.delete.mockRejectedValue(new Error("Deletion failed"));

      const response = repo.delete("any-code");

      expect(response).rejects.toThrow(Error);
      expect(prismaMock.url.delete).toHaveBeenCalledTimes(1);
    });
  });
});
