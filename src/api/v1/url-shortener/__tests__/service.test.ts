import { Url } from "@/generated/prisma";

import { UrlShortenerService } from "../service";
import { Repository } from "../repository";
import { CodeGenerator } from "../utils";

const mockRepository: Repository = {
  create: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

const mockCodeGenerator: CodeGenerator = {
  generateByRange: jest.fn(),
};

describe("UrlShortenerService", () => {
  let service: UrlShortenerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UrlShortenerService(mockRepository, mockCodeGenerator);
  });

  describe("createShortUrl", () => {
    it("Should generate a short code and create a URL via the repository", async () => {
      const paramUrl = "https://github.com/EduardoV-dev";

      const mockGeneratedCode = "my-code";

      const mockCreatedUrl: Url = {
        clickCount: 0, // Assuming clickCount is part of Url based on updateByCode usage
        createdAt: new Date(),
        id: 1,
        originalUrl: paramUrl,
        shortCode: mockGeneratedCode,
        updatedAt: new Date(),
      };

      (mockCodeGenerator.generateByRange as jest.Mock).mockReturnValue(
        mockGeneratedCode,
      );
      (mockRepository.create as jest.Mock).mockResolvedValue(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledTimes(1);
      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledWith(6, 10);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        shortCode: mockGeneratedCode,
        originalUrl: paramUrl,
      });

      expect(response).toEqual(mockCreatedUrl);
    });

    it("Should throw Error", async () => {
      const paramUrl = "https://github.com/EduardoV-dev";
      const mockGeneratedCode = "my-code";
      (mockCodeGenerator.generateByRange as jest.Mock).mockReturnValue(
        mockGeneratedCode,
      );
      (mockRepository.create as jest.Mock).mockRejectedValue(new Error("fail"));
      await expect(service.createShortUrl(paramUrl)).rejects.toThrow("fail");
    });

    describe("getUrl", () => {
      it("Should retrieve and update a URL if found", async () => {
        const shortCode = "abc123";
        const mockUrl: Url = {
          clickCount: 1,
          createdAt: new Date(),
          id: 1,
          originalUrl: "https://test.com",
          shortCode,
          updatedAt: new Date(),
        };
        const updatedUrl: Url = { ...mockUrl, clickCount: 2 };
        (mockRepository.get as jest.Mock).mockResolvedValue(mockUrl);
        (mockRepository.update as jest.Mock).mockResolvedValue(updatedUrl);
        const result = await service.getUrl(shortCode);
        expect(mockRepository.get).toHaveBeenCalledWith(shortCode);
        expect(mockRepository.update).toHaveBeenCalledWith(shortCode, {
          clickCount: mockUrl.clickCount + 1,
        });
        expect(result).toEqual(updatedUrl);
      });

      it("Should throw HttpError with 404 if URL not found", async () => {
        (mockRepository.get as jest.Mock).mockResolvedValue(null);
        await expect(service.getUrl("notfound")).rejects.toThrow(
          "Url not found",
        );
      });

      it("Should throw HttpError if repository.get throws", async () => {
        (mockRepository.get as jest.Mock).mockRejectedValue(new Error("fail"));
        await expect(service.getUrl("fail")).rejects.toThrow("fail");
      });
    });

    describe("deleteUrl", () => {
      it("Should delete a URL and return it", async () => {
        const shortCode = "del123";
        const mockUrl: Url = {
          clickCount: 0,
          createdAt: new Date(),
          id: 2,
          originalUrl: "https://delete.com",
          shortCode,
          updatedAt: new Date(),
        };
        (mockRepository.delete as jest.Mock).mockResolvedValue(mockUrl);
        const result = await service.deleteUrl(shortCode);
        expect(mockRepository.delete).toHaveBeenCalledWith(shortCode);
        expect(result).toEqual(mockUrl);
      });

      it("Should throw HttpError if repository.delete throws", async () => {
        (mockRepository.delete as jest.Mock).mockRejectedValue(
          new Error("fail"),
        );
        await expect(service.deleteUrl("fail")).rejects.toThrow("fail");
      });
    });
  });
});
