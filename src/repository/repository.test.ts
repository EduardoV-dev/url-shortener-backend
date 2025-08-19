import { prismaMock } from "@/test/prisma-mock";

import { RepositoryImpl } from ".";
import { FindAllImpl } from "./methods/find-all";
import { FindOneImpl } from "./methods/find-one";

describe("Repository", () => {
  it("should create an instance all methods", () => {
    const repo = new RepositoryImpl(prismaMock.url);

    expect(repo).toBeInstanceOf(RepositoryImpl);
    expect(repo.create).toBeInstanceOf(Function);
    expect(repo.delete).toBeInstanceOf(Function);
    expect(repo.update).toBeInstanceOf(Function);
    expect(repo.findAll()).toBeInstanceOf(FindAllImpl);
    expect(repo.findOne()).toBeInstanceOf(FindOneImpl);
  });
});
