import { Repository } from "./repository";
import { Url } from "@/generated/prisma";
import { HttpError } from "@/utils/http-error";
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

  /**
   * Retrieves and updates a URL by its short code.
   * Increments the click count.
   * @param shortCode - The short code to search for.
   * @returns The updated Url object.
   * @throws HttpError if not found or retrieval fails.
   */
  getUrl: (shortCode: string) => Promise<Url>;

  /**
   * Deletes a URL by its short code.
   * @param shortCode - The short code to delete.
   * @returns The deleted Url object or null if not found.
   * @throws HttpError if deletion fails.
   */
  deleteUrl: (shortCode: string) => Promise<Url | null>;
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
    try {
      const shortCode: string = await this.codeGenerator.generateByRange(6, 10);
      return this.repository.create({ shortCode, originalUrl: url });
    } catch (err) {
      const error = err as Error;
      throw new HttpError(error.message, 500, error);
    }
  };

  public getUrl: Service["createShortUrl"] = async (shortCode) => {
    try {
      const url = await this.repository.get(shortCode);
      if (!url) throw new HttpError("Url not found", 404);

      return this.repository.update(shortCode, {
        clickCount: url.clickCount + 1,
      });
    } catch (err) {
      const error = err as Error;
      throw new HttpError(error.message, 500, error);
    }
  };

  public deleteUrl: Service["deleteUrl"] = async (shortCode) => {
    try {
      const url = await this.repository.delete(shortCode);
      return url;
    } catch (err) {
      const error = err as Error;
      throw new HttpError(error.message, 500, error);
    }
  };
}
