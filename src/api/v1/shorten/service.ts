import { Url } from "@/generated/prisma";

import { Repository } from "./repository";
import { CodeGenerator, MAX_CODE_LENGTH, MIN_CODE_LENGTH } from "./short-code-generator";

/**
 * Service interface for URL shortener business logic.
 */
export interface Service {
  /**
   * Creates a new shortened URL.
   * @param url - The original URL to shorten.
   * @returns The created Url object.
   * @throws HttpError if creation fails.
   */
  createShortUrl: (url: string) => Promise<Url>;
}

/**
 * Implementation of the Service interface for URL shortener logic.
 */
export class UrlShortenerService implements Service {
  /**
   * @param repository - The repository for data access.
   * @param codeGenerator - The code generator for short codes.
   */
  constructor(
    private repository: Repository,
    private codeGenerator: CodeGenerator,
  ) {}

  public createShortUrl: Service["createShortUrl"] = async (url) => {
    const shortId: string = await this.codeGenerator.generateByRange(
      MIN_CODE_LENGTH,
      MAX_CODE_LENGTH,
    );

    return await this.repository.create({ shortId, longUrl: url });
  };
}
