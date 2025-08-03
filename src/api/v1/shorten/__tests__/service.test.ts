import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";

import { Repository } from "../repository";
import { UrlShortenerService } from "../service";
import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "../short-code-generator";
import { MOCK_URL } from "./mocks";

describe("UrlShortenerService", () => {
  let service: UrlShortenerService;
  let mockRepository: jest.Mocked<Repository>;
  let mockCodeGenerator: jest.Mocked<CodeGenerator>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = { create: jest.fn() };
    mockCodeGenerator = { generateByRange: jest.fn() };

    service = new UrlShortenerService(mockRepository, mockCodeGenerator);
  });

  describe("createShortUrl", () => {
    const paramUrl = "https://github.com/EduardoV-dev";
    const mockGeneratedCode = "my-code";

    it("Should generate a short code and create an URL using the repository", async () => {
      const mockCreatedUrl: Url = {
        ...MOCK_URL,
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
      };

      mockCodeGenerator.generateByRange.mockResolvedValue(mockGeneratedCode);
      mockRepository.create.mockResolvedValue(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledTimes(1);
      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledWith(
        MIN_CODE_LENGTH,
        MAX_CODE_LENGTH,
      );

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
      });

      expect(response).toEqual(mockCreatedUrl);
    });

    it("Should throw error when url could not be created", async () => {
      mockRepository.create.mockRejectedValue(
        new ApiError("Database error", { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }),
      );

      const response = service.createShortUrl(paramUrl);

      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });
});
