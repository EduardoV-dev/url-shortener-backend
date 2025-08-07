import { Url } from "@/generated/prisma";
import { logger } from "@/utils/logger";
import { Retry } from "@/utils/retry";

import { PrismaErrorHandlerImpl } from "../../utils/prisma-error-handler";
import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "./short-code-generator";
import { ShortenRepository } from "./shorten.repository";

/**
 * Service interface for URL shortener business logic.
 */
export interface ShortenService {
  /**
   * Creates a new shortened URL.
   * @param url - The original URL to shorten.
   * @returns The created Url object.
   * @throws HttpError if creation fails.
   */
  createShortUrl: (url: string) => Promise<Url>;
}

export interface ShortenServiceConstructor {
  /**
   * Repository for accessing and manipulating shortened URLs.
   */
  repository: ShortenRepository;
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
export class ShortenServiceImpl implements ShortenService {
  private readonly codeGenerator: CodeGenerator;
  private readonly repository: ShortenRepository;
  private readonly retry: Retry;

  constructor({ codeGenerator, repository, retry }: ShortenServiceConstructor) {
    this.codeGenerator = codeGenerator;
    this.repository = repository;
    this.retry = retry;
  }

  public createShortUrl: ShortenService["createShortUrl"] = async (url) => {
    const retry = this.retry
      .setOnRetry((error, attempt) => {
        logger.warn(`UrlShortenerController.createUrl | Attempt ${attempt} failed:`, error);
      })
      .setShouldRetry(PrismaErrorHandlerImpl.checkUniqueConstraint);

    try {
      return await retry.execute(async () => {
        logger.info("Creating short URL for:", url);

        const shortId: string = await this.codeGenerator.generateByRange(
          MIN_CODE_LENGTH,
          MAX_CODE_LENGTH,
        );

        return await this.repository.write.create({ shortId, longUrl: url });
      });
    } catch (err) {
      throw new PrismaErrorHandlerImpl(err).handleError<Url>({
        entity: "Url",
        uniqueField: "shortId",
        loggerMessage: "UrlShortenerService.createShortUrl | Error creating short URL",
      });
    }
  };
}
