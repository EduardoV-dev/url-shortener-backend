import { ReadRepositoryImpl } from "../../read-repository";

describe("ReadRepository", () => {
  it("Creates a ReadRepository instance", () => {
    const readRepository = new ReadRepositoryImpl("url");

    expect(readRepository).toBeInstanceOf(ReadRepositoryImpl);
    expect(readRepository.findAll).toBeDefined();
    expect(readRepository.findOne).toBeDefined();
  });
});
