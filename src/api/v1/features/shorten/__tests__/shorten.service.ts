import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { Url } from "@/generated/prisma";
import { MOCK_PRISMA_ERRORS, MockInterface } from "@/test/mocks";
import { logger } from "@/utils/logger";
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

    it("Should retry when SHORT_ID_ALREADY_EXISTS error occurs and succeed on second attempt (logs every failed attempt)", async () => {
      const mockCreatedUrl: Url = {
        ...MOCK_URL,
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
      };

      const ATTEMPTS = 2;

      mockCodeGenerator.generateByRange.mockResolvedValue(mockGeneratedCode);

      mockRepository.write.create
        .mockRejectedValueOnce(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED)
        .mockResolvedValueOnce(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(response).toEqual(mockCreatedUrl);
      expect(mockRepository.write.create).toHaveBeenCalledTimes(ATTEMPTS);
      expect(logger.warn).toHaveBeenCalledTimes(ATTEMPTS - 1);
    });
  });
});

export type MockShortenService = MockInterface<ShortenService>;

export const MOCK_SHORTEN_SERVICE: MockShortenService = {
  createShortUrl: jest.fn(),
};
