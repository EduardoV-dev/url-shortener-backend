import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { WriteRepositoryImpl } from "../write-repository";

describe("WriteRepository", () => {
  let writeRepo: WriteRepositoryImpl<Url>;
  const paramUrl = "https://example.com";

  const mockUrl: Url = {
    createdAt: new Date(),
    id: "1",
    longUrl: paramUrl,
    shortId: "abc123",
    userId: null,
  };

  beforeEach(() => {
    writeRepo = new WriteRepositoryImpl<Url>("url");
  });

  it("Creates a new record (Url)", async () => {
    prismaMock.url.create.mockResolvedValue(mockUrl);
    const newUser = await writeRepo.create({ longUrl: paramUrl });

    expect(newUser).toEqual(mockUrl);
    expect(prismaMock.url.create).toHaveBeenCalledWith({ data: { longUrl: paramUrl } });
    expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
  });

  it("Updates a new record (Url)", async () => {
    const updatedUrl = "https://updated-example.com";
    const updatedRecord: Url = { ...mockUrl, longUrl: updatedUrl };

    prismaMock.url.update.mockResolvedValue(updatedRecord);

    const updatedUser = await writeRepo.update({ longUrl: updatedUrl }, { id: "1" });

    expect(updatedUser).toEqual(updatedRecord);
    expect(prismaMock.url.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { longUrl: updatedUrl },
    });
    expect(prismaMock.url.update).toHaveBeenCalledTimes(1);
  });

  it("Deletes a record (Url)", async () => {
    prismaMock.url.delete.mockResolvedValue(mockUrl);

    const result = await writeRepo.delete({ id: "1" });

    expect(result).toEqual(mockUrl);
    expect(prismaMock.url.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(prismaMock.url.delete).toHaveBeenCalledTimes(1);
  });
});
