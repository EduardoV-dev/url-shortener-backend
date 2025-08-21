import { MOCK_URL, MOCK_URLS } from "@/api/v1/test/links.mocks";
import { createMockRepository, MockRepository } from "@/api/v1/test/repositories.mocks";
import { Url } from "@/generated/prisma";
import { executeFindAllWithParams, PaginationResponse } from "@/repository";
import { MOCK_PRISMA_ERRORS, MockInterface } from "@/test/mocks";
import { logger } from "@/utils/logger";
import { Retry, RetryImpl } from "@/utils/retry";

import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "../short-code-generator";
import { UrlService, UrlServiceImpl } from "../url.service";

jest.mock("@/repository");

describe("UrlService", () => {
  let service: UrlServiceImpl;
  let mockRepository: MockRepository<Url>;
  let mockCodeGenerator: jest.Mocked<CodeGenerator>;
  let mockRetry: Retry;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = createMockRepository<Url>();
    mockCodeGenerator = { generateByRange: jest.fn() };
    mockRetry = new RetryImpl().setDelayMs(0);

    service = new UrlServiceImpl({
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
      mockRepository.create.mockResolvedValue(mockCreatedUrl);
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

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
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
      mockRepository.create.mockResolvedValue(createdUrl);

      const response = await service.createShortUrl(paramUrl, paramId);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
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

      mockRepository.create
        .mockRejectedValueOnce(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED)
        .mockResolvedValueOnce(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(response).toEqual(mockCreatedUrl);
      expect(mockRepository.create).toHaveBeenCalledTimes(ATTEMPTS);
      expect(logger.warn).toHaveBeenCalledTimes(ATTEMPTS - 1);
    });
  });

  describe("find", () => {
    it("Should find a single url with the unique shortId", async () => {
      mockRepository.findOne().setWhere({ shortId: MOCK_URL.shortId }).execute = jest
        .fn()
        .mockResolvedValue(MOCK_URL);

      const response = await service.find(MOCK_URL.shortId);

      expect(mockRepository.findOne().setWhere).toHaveBeenCalledWith({
        shortId: MOCK_URL.shortId,
      });
      expect(mockRepository.findOne().execute).toHaveBeenCalledTimes(1);
      expect(response).toEqual(MOCK_URL);
    });

    it("Should return null if no URL is found with the given shortId", async () => {
      mockRepository.findOne().setWhere({ shortId: "nonexistant" }).execute = jest
        .fn()
        .mockResolvedValue(null);

      const response = await service.find("nonexistant");

      expect(mockRepository.findOne().setWhere).toHaveBeenCalledWith({
        shortId: "nonexistant",
      });
      expect(mockRepository.findOne().execute).toHaveBeenCalledTimes(1);
      expect(response).toBeNull();
    });
  });

  describe("findByUserId", () => {
    const mockUrlsByUserId = MOCK_URLS.filter((url) => url.userId === MOCK_URL.userId);

    const mockResponse: PaginationResponse<Url> = {
      results: mockUrlsByUserId,
      meta: {
        totalItems: mockUrlsByUserId.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      },
    };

    it("Logs the action of getting URLs by userId", async () => {
      await service.findByUserId({ userId: MOCK_URL.userId! });
      expect(logger.info).toHaveBeenCalled();
    });

    it("Gets paginated urls from a user by userId", async () => {
      (executeFindAllWithParams as jest.Mock).mockResolvedValue(mockResponse);
      const response = await service.findByUserId({ userId: MOCK_URL.userId! });
      expect(response).toEqual(mockResponse);
    });
  });
});

export type MockUrlService = MockInterface<UrlService>;

export const MOCK_SHORTEN_SERVICE: MockUrlService = {
  createShortUrl: jest.fn(),
  find: jest.fn(),
  findByUserId: jest.fn(),
};
