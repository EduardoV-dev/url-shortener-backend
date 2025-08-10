import { createMockRepository } from "@/api/v1/test/repositories.mocks";
import { User } from "@/generated/prisma";

import { UserRepositoryImpl } from "../user.repository";

describe("UserRepository", () => {
  it("Creates a UserRepository instance", () => {
    const repo = createMockRepository<User>();
    const repository = new UserRepositoryImpl(repo.read, repo.write);

    expect(repository).toBeInstanceOf(UserRepositoryImpl);
  });
});
