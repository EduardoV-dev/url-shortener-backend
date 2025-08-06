/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@/generated/prisma";
import { prisma } from "@/storage/prisma";

/**
 * Type representing a partial object of type T, used for filtering and selection.
 */
export type Where<T> = Partial<T>;
/**
 * Type representing a selection of fields in an object of type T, where each field can be included or excluded.
 * This is useful for specifying which fields to return in a query.
 */
export type Select<T> = Partial<Record<keyof T, boolean>>;

/**
 * Base repository class for Prisma ORM operations.
 * Provides access to the Prisma model delegate for CRUD operations.
 */
export abstract class BaseRepositoryImpl {
  /**
   * @param modelName - The name of the Prisma model.
   */
  constructor(protected modelName: keyof PrismaClient) {}

  /**
   * Gets the Prisma model delegate for the specified model name.
   * This allows access to the model's CRUD operations.
   * @returns The Prisma model delegate for the specified model name.
   */
  protected get modelDelegate() {
    return (prisma as any)[this.modelName] as any;
  }
}
