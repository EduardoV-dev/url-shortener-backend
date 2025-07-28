import { HTTP_STATUS } from "@/config/http-status";
import { Url } from "@/generated/prisma";
import { HttpError } from "@/utils/http-error";

import { Repository } from "../repository";
import { UrlShortenerService } from "../service";
import { CodeGenerator } from "../utils";
import { mockUrl } from "./mocks";

describe("UrlShortenerService", () => {
  let service: UrlShortenerService;
  let mockRepository: jest.Mocked<Repository>;
  let mockCodeGenerator: jest.Mocked<CodeGenerator>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    mockCodeGenerator = {
      generateByRange: jest.fn(),
    };

    service = new UrlShortenerService(mockRepository, mockCodeGenerator);
  });

  describe("createShortUrl", () => {
    const paramUrl = "https://github.com/EduardoV-dev";
    const mockGeneratedCode = "my-code";

    it("Should generate a short code and create a URL via the repository", async () => {
      const mockCreatedUrl: Url = {
        ...mockUrl,
        originalUrl: paramUrl,
      };

      mockCodeGenerator.generateByRange.mockResolvedValue(mockGeneratedCode);
      mockRepository.create.mockResolvedValue(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledTimes(1);
      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledWith(6, 10); // Internally, the code generator use 6 - 10 range

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        shortCode: mockGeneratedCode,
        originalUrl: paramUrl,
      });

      expect(response).toEqual(mockCreatedUrl);
    });

    it("Should throw error when url could not be created", async () => {
      mockRepository.create.mockRejectedValue(new HttpError("Database error", 500));

      const response = service.createShortUrl(paramUrl);

      await expect(response).rejects.toThrow(HttpError);
      await expect(response).rejects.toHaveProperty(
        "statusCode",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe("getUrl", () => {
    it("Should retrieve a URL by its short code", async () => {
      mockRepository.get.mockResolvedValue(mockUrl);
      const response = await service.getUrl(mockUrl.shortCode);
      expect(response).toEqual(mockUrl);
    });

    it("Should throw HttpError with 404 if URL not found", async () => {
      mockRepository.get.mockResolvedValue(null);

      const response = service.getUrl("not-found");

      await expect(response).rejects.toThrow(HttpError);
      await expect(response).rejects.toHaveProperty("statusCode", HTTP_STATUS.NOT_FOUND);
    });

    it("Should throw HttpError 500 status code (Internal Server Error)", async () => {
      mockRepository.get.mockRejectedValue(
        new HttpError("Internal server error", HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      const response = service.getUrl("fail");

      await expect(response).rejects.toThrow(HttpError);
      await expect(response).rejects.toHaveProperty(
        "statusCode",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe("getUrlStats", () => {
    it("Should retrieve URL stats by its short code", async () => {
      mockRepository.get.mockResolvedValue(mockUrl);
    });
  });

  describe("deleteUrl", () => {
    it("Should delete a URL and return it", async () => {
      const shortCode = "del123";
      const url: Url = { ...mockUrl, shortCode };

      mockRepository.delete.mockResolvedValue(url);

      const result = await service.deleteUrl(shortCode);

      expect(mockRepository.delete).toHaveBeenCalledWith(shortCode);
      expect(result).toEqual(url);
    });

    it("Should throw error", async () => {
      mockRepository.delete.mockRejectedValue(
        new HttpError("fail", HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      const response = service.deleteUrl("fail");
      await expect(response).rejects.toThrow(HttpError);
    });
  });

  describe("updateUrl", (): void => {
    it("Should update a URL by its short code", async () => {
      const updatedUrl: Url = {
        ...mockUrl,
        originalUrl: "https://new-url.com",
        clickCount: 2,
      };
      mockRepository.update.mockResolvedValue(updatedUrl);

      const response = await service.updateUrl(updatedUrl.shortCode, updatedUrl);

      expect(mockRepository.update).toHaveBeenCalledWith(updatedUrl.shortCode, updatedUrl);
      expect(response).toEqual(updatedUrl);
    });

    it("Should throw error", async () => {
      mockRepository.update.mockRejectedValue(
        new HttpError("fail", HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      const response = service.updateUrl("fail", {});
      await expect(response).rejects.toThrow(HttpError);
    });
  });

  describe("updateClickCount", () => {
    it("Should increment the click count of a URL", async () => {
      const newUrl = {
        ...mockUrl,
        clickCount: mockUrl.clickCount + 1,
      };

      mockRepository.get.mockResolvedValue(mockUrl);
      mockRepository.update.mockResolvedValue(newUrl);

      const response = await service.updateClickCount(mockUrl.shortCode);

      expect(response).toEqual(newUrl);
    });
  });
});
