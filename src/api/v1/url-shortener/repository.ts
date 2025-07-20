import { PRISMA_CODES } from "@/constants/prisma-codes";
import { Prisma, Url } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";
import { HttpError } from "@/utils/http-error";

/**
 * Parameters required to create a new shortened URL.
 */
interface CreateParams {
  /** The unique short code for the URL. */
  shortCode: string;
  /** The original URL to be shortened. */
  originalUrl: string;
}

/**
 * Repository interface for URL shortener operations.
 */
export interface Repository {
  /**
   * Creates a new shortened URL.
   * @param params - The parameters for the new URL.
   * @returns The created Url object.
   */
  create: (params: CreateParams) => Promise<Url>;

  /**
   * Retrieves a URL by its short code.
   * @param shortCode - The short code to search for.
   * @returns The Url object if found, otherwise null.
   */
  get: (shortCode: string) => Promise<Url | null>;

  /**
   * Updates a URL by its short code.
   * @param shortCode - The short code to update.
   * @param data - The fields to update.
   * @returns The updated Url object.
   * @throws Error if the URL is not found or update fails.
   */
  update: (shortCode: string, data: Partial<Url>) => Promise<Url>;

  /**
   * Deletes a URL by its short code.
   * @param shortCode - The short code to delete.
   * @returns The deleted Url object.
   * @throws Error if the URL is not found or deletion fails.
   */
  delete: (shortCode: string) => Promise<Url>;
}

/**
 * Implementation of the Repository interface using Prisma ORM.
 * Provides methods to create, retrieve, update, and delete shortened URLs.
 */
export class UrlShortenerRepository implements Repository {
  public create: Repository["create"] = async (params) => {
    try {
      return await prisma.url.create({
        data: params,
      });
    } catch (err) {
      throw new HttpError("Error creating url", 500, err);
    }
  };

  public get: Repository["get"] = async (code) => {
    try {
      const url: Url | null = await prisma.url.findFirst({
        where: { shortCode: code },
      });
      return url;
    } catch (err) {
      throw new HttpError("Error retrieving url", 500, err);
    }
  };

  public update: Repository["update"] = async (code, data) => {
    try {
      return await prisma.url.update({
        where: {
          shortCode: code,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      if (validatePrismaRecordNotFound(err))
        throw new HttpError("Url to update not found", 404, err);

      throw new HttpError("Error updating url", 500, err);
    }
  };

  public delete: Repository["delete"] = async (code) => {
    try {
      return await prisma.url.delete({
        where: {
          shortCode: code,
        },
      });
    } catch (err) {
      if (validatePrismaRecordNotFound(err))
        throw new HttpError("Url to delete not found", 404, err);

      throw new HttpError("Error deleting url", 500, err);
    }
  };
}

// === Utils

const validatePrismaRecordNotFound = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError &&
  err.code === PRISMA_CODES.RECORD_NOT_FOUND;
