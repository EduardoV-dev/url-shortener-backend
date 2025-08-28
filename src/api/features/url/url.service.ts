import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { executeFindAllWithParams, PaginationResponse, WithFindAllQueryParams } from "@/repository";
import { ApiError } from "@/utils/api-error";
import { logger } from "@/utils/logger";
import { PrismaErrorHandlerImpl } from "@/utils/prisma-error-handler";
import { Retry } from "@/utils/retry";

import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "./short-code-generator";
import { UrlRepository } from "./url.repository";

export type FindUrlsByUserIdParams = WithFindAllQueryParams<{ userId: string }>;

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
  findOneByShortId: (shortId: string) => Promise<Url | null>;
  /**
   * Finds all URLs associated with a specific user ID, with pagination support.
   * @param userId - The user ID whose URLs are to be retrieved.
   * @returns A paginated result containing the URLs associated with the user.
   */
  findAllByUserId: (params: FindUrlsByUserIdParams) => Promise<PaginationResponse<Url>>;
  /**
   * Deletes a shortened URL by its short ID.
   * @param shortId - The short ID of the URL to delete.
   * @param userId - Optional user ID for associating the deletion with a user.
   * @returns The deleted Url object.
   * @throws ApiError if the URL is not found or if the user does not have permission to delete it.
   */
  deleteOneByShortId: (shortId: string, userId?: string) => Promise<Url>;
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

      return await this.repository.create({
        longUrl: url,
        shortId,
        userId,
      });
    });
  };

  public findOneByShortId: UrlService["findOneByShortId"] = async (shortId) => {
    logger.info(`Finding URL with shortId: ${shortId}`);

    const url: Url | null = await this.repository.findOne().setWhere({ shortId }).execute();
    return url;
  };

  public findAllByUserId: UrlService["findAllByUserId"] = async ({ userId, ...pagination }) => {
    logger.info(`Finding URLs for userId: ${userId}`);

    return executeFindAllWithParams(pagination, this.repository.findAll().setWhere({ userId }));
  };

  public deleteOneByShortId: UrlService["deleteOneByShortId"] = async (shortId, userId) => {
    logger.info(`Deleting URL with shortId: ${shortId}`);

    const url: Url | null = await this.findOneByShortId(shortId);
    if (!url)
      throw new ApiError(`URL with shortId ${shortId} not found`, {
        status: HTTP_STATUS.NOT_FOUND,
      });

    if (!url.userId)
      throw new ApiError("Cannot delete an anonymous URL", { status: HTTP_STATUS.BAD_REQUEST });

    if (url.userId !== userId)
      throw new ApiError("You do not have permission to delete this URL", {
        status: HTTP_STATUS.FORBIDDEN,
      });

    return await this.repository.delete({ shortId });
  };
}
