import { PRISMA_CODES } from "@/constants/common";
import { Prisma, Url } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";
import { ApiError } from "@/utils/api-error";
import { logger } from "@/utils/logger";

export const ERROR_CODES = {
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
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === PRISMA_CODES.UNIQUE_CONSTRAINT_FAILED
      ) {
        logger.error(
          "UrlShortenerRepository | create",
          "Short ID already exists, please try again with a different ID.",
          err,
        );

        throw new ApiError("Short ID already exists", {
          code: ERROR_CODES.CREATE.SHORT_ID_ALREADY_EXISTS,
        });
      }

      logger.error("UrlShortenerRepository | create", err);
      throw new ApiError("Error creating url", {
        code: ERROR_CODES.CREATE.INTERNAL_SERVER_ERROR,
      });
    }
  };
}
