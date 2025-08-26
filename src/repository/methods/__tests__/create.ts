import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/__mocks__/prisma";

import { CreateMethodImpl } from "../create";

describe("CreateMethod", () => {
  describe("Create", () => {
    it("Should create a new record", async () => {
      // TODO: Place the mock somewhere else, the issue is that the url mocks are in v1
      const mockResponse: Url = {
        createdAt: new Date(),
        id: "1",
        longUrl: "https://example.com",
        shortId: "1",
        userId: "user1",
      };

      const mockData = { longUrl: "https://example.com" };

      prismaMock.url.create.mockResolvedValue(mockResponse);

      const createMethod = new CreateMethodImpl<Url>(prismaMock.url);
      const result = await createMethod.create(mockData);

      expect(result).toEqual(mockResponse);
      expect(prismaMock.url.create).toHaveBeenCalledWith({ data: mockData });
    });
  });
});
