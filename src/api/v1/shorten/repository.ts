import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";
import { HttpError } from "@/utils/http-error";

/**
 * Parameters required to create a new shortened URL.
 */
export type UrlCreateParams = Pick<Url, "shortId" | "longUrl">;

/**
 * Repository interface for URL shortener operations.
 */
export interface Repository {
  /**
   * Creates a new shortened URL.
   * @param params - The parameters for the new URL.
   * @returns The created Url object.
   */
  create: (params: UrlCreateParams) => Promise<Url>;
}

/**
 * Implementation of the Repository interface using Prisma ORM.
 * Provides methods to create, retrieve, update, and delete shortened URLs.
 */
export class UrlShortenerRepository implements Repository {
  public create: Repository["create"] = async (data) => {
    try {
      return await prisma.url.create({ data });
    } catch (err) {
      throw new HttpError("Error creating url", HTTP_STATUS.INTERNAL_SERVER_ERROR, err);
    }
  };
}
