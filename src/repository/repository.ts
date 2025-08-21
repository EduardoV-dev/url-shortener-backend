import { Model } from "./bases/prisma-model";
import { CreateMethod, CreateMethodImpl } from "./methods/create";
import { DeleteMethod, DeleteMethodImpl } from "./methods/delete";
import { FindAll, FindAllImpl } from "./methods/find-all";
import { FindOne, FindOneImpl } from "./methods/find-one";
import { UpdateMethod, UpdateMethodImpl } from "./methods/update";

export interface Repository<T> extends CreateMethod<T>, DeleteMethod<T>, UpdateMethod<T> {
  /**
   * Returns an instance of FindAll to retrieve multiple records.
   * uses builder pattern to set conditions before executing the query.
   * @returns An instance of FindAll<T>.
   */
  findAll(): FindAll<T>;
  /**
   * Returns an instance of FindOne to retrieve a single record.
   * uses builder pattern to set conditions before executing the query.
   * @returns An instance of FindOne<T>.
   */
  findOne(): FindOne<T>;
}

/**
 * A generic repository implementation that provides CRUD operations for a specific model.
 * @template T - The type of the model the repository will manage.
 * @example
 * import { prisma } from "@generated/prisma";
 *
 * export class UserRepository extends RepositoryImpl<User> {
 *    super(prisma.url)
 * }
 */
export class RepositoryImpl<T> implements Repository<T> {
  public create: Repository<T>["create"];
  public delete: Repository<T>["delete"];
  public update: Repository<T>["update"];
  public findAll: Repository<T>["findAll"];
  public findOne: Repository<T>["findOne"];

  constructor(model: Model) {
    this.create = new CreateMethodImpl<T>(model).create;
    this.delete = new DeleteMethodImpl<T>(model).delete;
    this.update = new UpdateMethodImpl<T>(model).update;

    this.findAll = () => new FindAllImpl<T>(model);
    this.findOne = () => new FindOneImpl<T>(model);
  }
}
