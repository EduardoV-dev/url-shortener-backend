import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { MOCK_PRISMA_ERRORS, MockInterface } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";
import { Retry, RetryImpl } from "@/utils/retry";

import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "../short-code-generator";
import { ShortenService, ShortenServiceImpl } from "../shorten.service";

describe("UrlShortenerService", () => {
  let service: ShortenServiceImpl;
  let mockRepository: MockRepository<Url>;
  let mockCodeGenerator: jest.Mocked<CodeGenerator>;
  let mockRetry: Retry;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = createMockRepository<Url>();
    mockCodeGenerator = { generateByRange: jest.fn() };
    mockRetry = new RetryImpl().setDelayMs(0);

    service = new ShortenServiceImpl({
      codeGenerator: mockCodeGenerator,
      repository: mockRepository,
      retry: mockRetry,
    });
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
      mockRepository.write.create.mockResolvedValue(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledTimes(1);
      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledWith(
        MIN_CODE_LENGTH,
        MAX_CODE_LENGTH,
      );

      expect(mockRepository.write.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.write.create).toHaveBeenCalledWith({
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
      });

      expect(response).toEqual(mockCreatedUrl);
    });

    it("Should throw error if short id is being used and retries do not work", async () => {
      mockRepository.write.create.mockRejectedValue(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);

      const response = service.createShortUrl(paramUrl);

      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty("status", HTTP_STATUS.CONFLICT);
    });

    it("Should throw error when url could not be created", async () => {
      mockRepository.write.create.mockRejectedValue(new Error("Database error"));

      const response = service.createShortUrl(paramUrl);

      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty("status", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it("Should retry when SHORT_ID_ALREADY_EXISTS error occurs and succeed on second attempt", async () => {
      const mockCreatedUrl: Url = {
        ...MOCK_URL,
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
      };

      mockCodeGenerator.generateByRange.mockResolvedValue(mockGeneratedCode);

      mockRepository.write.create
        .mockRejectedValueOnce(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED)
        .mockResolvedValueOnce(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockRepository.write.create).toHaveBeenCalledTimes(2);
      expect(response).toEqual(mockCreatedUrl);
    });
  });
});

export type MockShortenService = MockInterface<ShortenService>;

export const MOCK_SHORTEN_SERVICE: MockShortenService = {
  createShortUrl: jest.fn(),
};
