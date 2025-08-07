import { Url } from "@/generated/prisma";

import { ReadRepository, Repository, RepositoryImpl, WriteRepository } from "../../repositories";

/**
 * Parameters required to create a new shortened URL.
 */
export type UrlCreateParams = Pick<Url, "shortId" | "longUrl">;

/**
 * Interface for the ShortenRepository, which extends the Repository interface.
 * This interface defines methods for reading and writing shortened URLs.
 */
export type ShortenRepository = Repository<Url>;

/**
 * Implementation of the ShortenRepository interface.
 * This class extends the Repository class to provide methods for URL shortening operations.
 * It uses the Prisma ORM to interact with the database.
 */
export class ShortenRepositoryImpl extends RepositoryImpl<Url> {
  constructor(read: ReadRepository<Url>, write: WriteRepository<Url>) {
    super(read, write);
  }
}
