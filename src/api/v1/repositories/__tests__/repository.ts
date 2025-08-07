import { MOCK_REPOSITORY } from "../../test/mocks";
import { RepositoryImpl } from "../repository";

describe("Repository", () => {
  it("should create an instance with read and write repositories", () => {
    const repository = new RepositoryImpl(MOCK_REPOSITORY.read, MOCK_REPOSITORY.write);
    expect(repository.read).toBeDefined();
    expect(repository.write).toBeDefined();
  });
});
