import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { FindOne, FindOneImpl } from "../../methods/find-one";

describe("ReadRepository | FindOne", () => {
  let findOne: FindOne<Url>;

  beforeEach(() => {
    findOne = new FindOneImpl<Url>(prismaMock.url);
  });

  it("Should create a FindOne instance", () => {
    expect(findOne).toBeDefined();
    expect(findOne.setSelect).toBeDefined();
    expect(findOne.setWhere).toBeDefined();
    expect(findOne.execute).toBeDefined();
  });

  it("Sets where and select conditions, then executes correctly", async () => {
    const url = {
      createdAt: MOCK_URL.createdAt,
      id: MOCK_URL.id,
      longUrl: MOCK_URL.longUrl,
    } as Url;

    prismaMock.url.findUnique.mockResolvedValue(url);

    const response = await findOne
      .setSelect({ createdAt: true, id: true, longUrl: true })
      .setWhere({ id: "1" })
      .execute();

    expect(response).toEqual(url);
  });

  it("Throws an error if where condition is not set", async () => {
    prismaMock.url.findUnique.mockResolvedValue(null);

    try {
      await findOne.execute();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
