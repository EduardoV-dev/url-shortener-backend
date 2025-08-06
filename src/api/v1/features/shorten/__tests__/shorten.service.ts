import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { Retry, RetryImpl } from "@/utils/retry";

import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "../short-code-generator";
import { SHORTEN_ERROR_CODES, ShortenRepositoryImpl } from "../shorten.repository";
import { ShortenServiceImpl } from "../shorten.service";
import { MOCK_URL } from "./mocks";

describe("UrlShortenerService", () => {
  let service: ShortenServiceImpl;
  let mockRepository: jest.Mocked<ShortenRepositoryImpl>;
  let mockCodeGenerator: jest.Mocked<CodeGenerator>;
  let mockRetry: Retry;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = { create: jest.fn() };
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

    const shortIdAlreadyExistsError = new ApiError("Short ID already exists").setCode(
      SHORTEN_ERROR_CODES.CREATE.SHORT_ID_ALREADY_EXISTS,
    );

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

    it("Should throw error if short id is being used and retries do not work", async () => {
      mockRepository.create.mockRejectedValue(shortIdAlreadyExistsError);

      const response = service.createShortUrl(paramUrl);

      await expect(response).rejects.toThrow(ApiError);
      await expect(response).rejects.toHaveProperty("status", HTTP_STATUS.CONFLICT);
    });

    it("Should throw error when url could not be created", async () => {
      mockRepository.create.mockRejectedValue(
        new ApiError("Database error").setCode(SHORTEN_ERROR_CODES.CREATE.INTERNAL_SERVER_ERROR),
      );

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

      mockRepository.create
        .mockRejectedValueOnce(
          new ApiError("Short ID already exists").setCode(
            SHORTEN_ERROR_CODES.CREATE.SHORT_ID_ALREADY_EXISTS,
          ),
        )
        .mockResolvedValueOnce(mockCreatedUrl);

      const response = await service.createShortUrl(paramUrl);

      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(response).toEqual(mockCreatedUrl);
    });
  });
});
