import { Url } from "@/generated/prisma";
import { UpdateMethodImpl } from "@/repository/methods/update";
import { prismaMock } from "@/test/prisma-mock";

describe("UpdateMethod", () => {
  describe("Update", () => {
    it("Should update a record", async () => {
      // TODO: Place the mock somewhere else, the issue is that the url mocks are in v1
      const mockResponse: Url = {
        createdAt: new Date(),
        id: "1",
        longUrl: "https://example.com",
        shortId: "1",
        userId: "user1",
      };

      prismaMock.url.update.mockResolvedValue(mockResponse);

      const updateMethod = new UpdateMethodImpl<Url>(prismaMock.url);
      const result = await updateMethod.update(
        { longUrl: "https://new-url.com" },
        { shortId: mockResponse.shortId },
      );

      expect(result).toEqual(mockResponse);
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        data: {
          longUrl: "https://new-url.com",
        },
        where: { shortId: mockResponse.shortId },
      });
    });
  });
});
