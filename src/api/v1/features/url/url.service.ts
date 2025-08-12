import { Url } from "@/generated/prisma";
import { logger } from "@/utils/logger";
import { Retry } from "@/utils/retry";

import { PrismaErrorHandlerImpl } from "../../utils/prisma-error-handler";
import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "./short-code-generator";
import { UrlRepository } from "./url.repository";

/**
 * Service interface for URL shortener business logic.
 */
export interface UrlService {
  /**
   * Creates a new shortened URL. If userId is provided, associates the URL with the user.
   * If userId is not provided, the URL is created anonymously.
   * This method generates a unique short code for the URL and stores it in the database.
   * It uses a retry mechanism to handle potential unique constraint violations.
   *
   * @param url - The original URL to shorten.
   * @param userId - Optional user ID for associating the URL with a user.
   * @returns The created Url object.
   * @throws HttpError if creation fails.
   */
  createShortUrl: (url: string, userId?: string) => Promise<Url>;
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
}
