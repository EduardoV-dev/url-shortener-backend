import { createMockRepository } from "../../test/mocks";
import { RepositoryImpl } from "../repository";

describe("Repository", () => {
  it("should create an instance with read and write repositories", () => {
    const mockRepo = createMockRepository();

    const repository = new RepositoryImpl(mockRepo.read, mockRepo.write);
    expect(repository.read).toBeDefined();
    expect(repository.write).toBeDefined();
  });
});
