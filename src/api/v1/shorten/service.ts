import { Url } from "@/generated/prisma";

import { Repository } from "./repository";
import { CodeGenerator } from "./utils";

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
    // TODO: For this service, check if there is a short url with the same short id, in case there is, generate a new one.
    const shortId: string = await this.codeGenerator.generateByRange(6, 10);
    return this.repository.create({ shortId, longUrl: url });
  };
}
