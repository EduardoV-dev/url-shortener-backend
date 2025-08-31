import { Url } from "@/generated/prisma";
import { MOCK_URL } from "@/test/__fixtures__/url";
import { prismaMock } from "@/test/__mocks__/prisma";
import { ApiError } from "@/utils/api-error";

import { FIND_ONE_ERROR_CODES, FindOne, FindOneImpl } from "../../methods/find-one";

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

  it("Sets where, omit, and select conditions, then executes correctly", async () => {
    const url = {
      id: MOCK_URL.id,
      longUrl: MOCK_URL.longUrl,
    } as Url;

    prismaMock.url.findUnique.mockResolvedValue(url);

    const response = await findOne
      .setSelect({ createdAt: true, id: true, longUrl: true })
      .setOmit({ createdAt: true })
      .setWhere({ id: "1" })
      .execute();

    expect(response).toEqual(url);
  });

  it("Throws an error if where condition is not set", async () => {
    prismaMock.url.findUnique.mockResolvedValue(null);

    try {
      await findOne.execute();
    } catch (error) {
      expect((error as ApiError).code).toBe(FIND_ONE_ERROR_CODES.VALIDATION);
    }
  });
});
