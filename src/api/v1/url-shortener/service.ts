import { Repository } from "./repository";
import { Url } from "@/generated/prisma";
import { HttpError } from "@/utils/http-error";
import { CodeGenerator } from "./utils";
import { HTTP_STATUS } from "@/config/http-status";

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
   * @returns The deleted Url object.
   * @throws HttpError if deletion fails.
   */
  deleteUrl: (shortCode: string) => Promise<Url>;
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
      throw err;
    }
  };

  public getUrl: Service["getUrl"] = async (shortCode) => {
    try {
      const url = await this.repository.get(shortCode);
      if (!url) throw new HttpError("Url not found", HTTP_STATUS.NOT_FOUND);

      return this.repository.update(shortCode, {
        clickCount: url.clickCount + 1,
      });
    } catch (err) {
      throw err;
    }
  };

  public deleteUrl: Service["deleteUrl"] = async (shortCode) => {
    try {
      return await this.repository.delete(shortCode);
    } catch (err) {
      throw err;
    }
  };
}
