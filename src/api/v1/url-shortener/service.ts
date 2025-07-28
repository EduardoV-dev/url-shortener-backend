import { HTTP_STATUS } from "@/config/http-status";
import { Url } from "@/generated/prisma";
import { HttpError } from "@/utils/http-error";

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
  /**
   * Updates a URL by its short code. Updates only click count and/or original URL.
   * @param shortCode - The short code of the URL to update.
   * @param data - The partial Url object containing fields to update.
   * @returns The updated Url properties.
   * @throws HttpError if update fails.
   */
  updateUrl: (shortCode: string, data: Partial<Url>) => Promise<Url>;
  /**
   * Updates the click count of a URL by its short code.
   * Increments the click count by 1.
   * @param shortCode - The short code of the URL to update.
   * @returns The updated Url object with incremented click count.
   * @throws HttpError if retrieval or update fails.
   */
  updateClickCount: (shortCode: string) => Promise<Url>;
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
    const shortCode: string = await this.codeGenerator.generateByRange(6, 10);
    return this.repository.create({ shortCode, originalUrl: url });
  };

  public getUrl: Service["getUrl"] = async (shortCode) => {
    const url = await this.repository.get(shortCode);
    if (!url) throw new HttpError("Url not found", HTTP_STATUS.NOT_FOUND);

    return url;
  };

  public deleteUrl: Service["deleteUrl"] = async (shortCode) => {
    return await this.repository.delete(shortCode);
  };

  public updateUrl: Service["updateUrl"] = async (shortCode, { clickCount, originalUrl }) => {
    return await this.repository.update(shortCode, {
      clickCount,
      originalUrl,
    });
  };

  public updateClickCount: Service["updateClickCount"] = async (shortCode) => {
    const url = this.getUrl(shortCode);

    return await this.updateUrl(shortCode, {
      clickCount: (await url).clickCount + 1,
    });
  };
}
