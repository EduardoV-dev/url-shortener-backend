import { Url } from "@/generated/prisma";
import { logger } from "@/utils/logger";
import { Retry } from "@/utils/retry";

import { PaginationQueryParams, PaginationResponse } from "../../repositories";
import { PrismaErrorHandlerImpl } from "../../utils/prisma-error-handler";
import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "./short-code-generator";
import { UrlRepository } from "./url.repository";

export interface FindUrlsByUserIdParams {
  /**
   * The user ID whose URLs are to be retrieved.
   * This is used to filter URLs associated with a specific user.
   */
  userId: string;
  /**
   * Pagination parameters for retrieving URLs.
   * This includes page number, page size, and optional sorting parameters.
   * @remarks This allows for efficient retrieval of URLs in a paginated manner.
   */
  pagination: PaginationQueryParams;
}

/**
 * Service interface for URL shortener business logic.
 */
export interface UrlService {
  /**
   * Creates a new shortened URL. If userId is provided, associates the URL with the user.
   * If userId is not provided, the URL is created anonymously.
   * This method generates a unique short code for the URL and stores it in the database.
   * It uses a retry mechanism to handle potential unique constraint violations.
   * @param url - The original URL to shorten.
   * @param userId - Optional user ID for associating the URL with a user.
   * @returns The created Url object.
   */
  createShortUrl: (url: string, userId?: string) => Promise<Url>;
  /**
   * Finds a shortened URL by its short ID.
   * @param shortId - The short ID of the URL to find.
   * @returns The Url object if found.
   * @throws ApiError if the URL is not found.
   */
  find: (shortId: string) => Promise<Url | null>;
  /**
   * Finds all URLs associated with a specific user ID, with pagination support.
   * @param userId - The user ID whose URLs are to be retrieved.
   * @returns A paginated result containing the URLs associated with the user.
   */
  findByUserId: (params: FindUrlsByUserIdParams) => Promise<PaginationResponse<Url>>;
}

interface UrlServiceConstructor {
  /**
   * Repository for accessing and manipulating shortened URLs.
   */
  repository: UrlRepository;
  /**
   * Code generator for generating unique short codes.
   */
  codeGenerator: CodeGenerator;
  /**
   * Retry utility for handling retries on failures.
   */
  retry: Retry;
}

/**
 * Implementation of the Service interface for URL shortener logic.
 */
export class UrlServiceImpl implements UrlService {
  private readonly codeGenerator: CodeGenerator;
  private readonly repository: UrlRepository;
  private readonly retry: Retry;

  constructor({ codeGenerator, repository, retry }: UrlServiceConstructor) {
    this.codeGenerator = codeGenerator;
    this.repository = repository;
    this.retry = retry;
  }

  public createShortUrl: UrlService["createShortUrl"] = async (url, userId = undefined) => {
    logger.info(`Creating short URL for: ${url}`);

    const retry = this.retry
      .setOnRetry((error, attempt) => {
        logger.warn(`UrlShortenerController.createUrl | Attempt ${attempt} failed:`, error);
      })
      .setShouldRetry(PrismaErrorHandlerImpl.checkUniqueConstraint);

    return await retry.execute(async () => {
      const shortId: string = await this.codeGenerator.generateByRange(
        MIN_CODE_LENGTH,
        MAX_CODE_LENGTH,
      );

      return await this.repository.write.create({ shortId, longUrl: url, userId });
    });
  };

  public find: UrlService["find"] = async (shortId) => {
    logger.info(`Finding URL with shortId: ${shortId}`);

    const url: Url | null = await this.repository.read.findOne().setWhere({ shortId }).execute();
    return url;
  };

  // TODO: Implement pagination utils for this method
  public findByUserId: UrlService["findByUserId"] = async ({ userId, pagination }) => {
    logger.info(`Finding URLs for userId: ${userId}`);

    return await this.repository.read.findAll().setPaginated().setWhere({ userId }).execute();
  };
}
