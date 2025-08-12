import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { Url } from "@/generated/prisma";
import { MOCK_PRISMA_ERRORS, MockInterface } from "@/test/mocks";
import { logger } from "@/utils/logger";
import { Retry, RetryImpl } from "@/utils/retry";

import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "../short-code-generator";
import { ShortenService, ShortenServiceImpl } from "../url.service";

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
    const paramId = "user-id";
    const mockGeneratedCode = "my-code";

    const mockCreatedUrl: Url = {
      ...MOCK_URL,
      shortId: mockGeneratedCode,
      longUrl: paramUrl,
      userId: null,
    };

    beforeEach(() => {
      jest.clearAllMocks();

      mockCodeGenerator.generateByRange.mockResolvedValue(mockGeneratedCode);
      mockRepository.write.create.mockResolvedValue(mockCreatedUrl);
    });

    it("Generates short codes correctly", () => {
      service.createShortUrl(paramUrl);

      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledTimes(1);
      expect(mockCodeGenerator.generateByRange).toHaveBeenCalledWith(
        MIN_CODE_LENGTH,
        MAX_CODE_LENGTH,
      );
    });

    it("Should create an URL anonymously", async () => {
      const response = await service.createShortUrl(paramUrl);

      expect(mockRepository.write.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.write.create).toHaveBeenCalledWith({
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
        userId: undefined,
      });

      expect(response).toEqual(mockCreatedUrl);
    });

    it("Creates a short URL with userId if provided", async () => {
      const createdUrl: Url = {
        ...mockCreatedUrl,
        userId: paramId,
      };
      mockRepository.write.create.mockResolvedValue(createdUrl);

      const response = await service.createShortUrl(paramUrl, paramId);
      expect(mockRepository.write.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.write.create).toHaveBeenCalledWith({
        shortId: mockGeneratedCode,
        longUrl: paramUrl,
        userId: paramId,
      });

      expect(response).toEqual(createdUrl);
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
