import { Url } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";
import { ApiError } from "@/utils/api-error";

import { PrismaErrorChecker } from "../../utils/error-handlers";

export const SHORTEN_ERROR_CODES = {
  CREATE: {
    INTERNAL_SERVER_ERROR: "CREATE.INTERNAL_SERVER_ERROR",
    SHORT_ID_ALREADY_EXISTS: "CREATE.SHORT_ID_ALREADY_EXISTS",
  },
};

/**
 * Parameters required to create a new shortened URL.
 */
export type UrlCreateParams = Pick<Url, "shortId" | "longUrl">;

/**
 * Repository interface for URL shortener operations.
 */
export interface ShortenRepository {
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
export class ShortenRepositoryImpl implements ShortenRepository {
  public create: ShortenRepository["create"] = async (data) => {
    try {
      return await prisma.url.create({ data });
    } catch (error) {
      if (PrismaErrorChecker.checkUniqueConstraint(error))
        throw new ApiError("Short ID already exists")
          .setCode(SHORTEN_ERROR_CODES.CREATE.SHORT_ID_ALREADY_EXISTS)
          .setDetails(error);

      throw new ApiError("Error creating url")
        .setCode(SHORTEN_ERROR_CODES.CREATE.INTERNAL_SERVER_ERROR)
        .setDetails(error);
    }
  };
}
