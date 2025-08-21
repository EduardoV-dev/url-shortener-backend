import { PrismaClient, Url } from "@/generated/prisma";
import { Repository, RepositoryImpl } from "@/repository";

/**
 * Parameters required to create a new shortened URL.
 */
export type UrlCreateParams = Pick<Url, "shortId" | "longUrl">;

/**
 * Interface for the ShortenRepository, which extends the Repository interface.
 * This interface defines methods for reading and writing shortened URLs.
 */
export type UrlRepository = Repository<Url>;

/**
 * Implementation of the ShortenRepository interface.
 * This class extends the Repository class to provide methods for URL shortening operations.
 * It uses the Prisma ORM to interact with the database.
 */
export class UrlRepositoryImpl extends RepositoryImpl<Url> implements UrlRepository {
  constructor(prisma: PrismaClient) {
    super(prisma.url);
  }
}
