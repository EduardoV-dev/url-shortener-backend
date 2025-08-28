import { Url } from "@/generated/prisma";
import { MOCK_URL } from "@/test/__fixtures__/url";
import { prismaMock } from "@/test/__mocks__/prisma";

import { CreateMethodImpl } from "../create";

describe("CreateMethod", () => {
  describe("Create", () => {
    it("Should create a new record", async () => {
      const mockData = { longUrl: "https://example.com" };

      prismaMock.url.create.mockResolvedValue(MOCK_URL);

      const createMethod = new CreateMethodImpl<Url>(prismaMock.url);
      const result = await createMethod.create(mockData);

      expect(result).toEqual(MOCK_URL);
      expect(prismaMock.url.create).toHaveBeenCalledWith({ data: mockData });
    });
  });
});
