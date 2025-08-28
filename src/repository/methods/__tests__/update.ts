import { Url } from "@/generated/prisma";
import { UpdateMethodImpl } from "@/repository/methods/update";
import { MOCK_URL } from "@/test/__fixtures__/url";
import { prismaMock } from "@/test/__mocks__/prisma";

describe("UpdateMethod", () => {
  describe("Update", () => {
    it("Should update a record", async () => {
      prismaMock.url.update.mockResolvedValue(MOCK_URL);

      const updateMethod = new UpdateMethodImpl<Url>(prismaMock.url);
      const result = await updateMethod.update(
        { longUrl: "https://new-url.com" },
        { shortId: MOCK_URL.shortId },
      );

      expect(result).toEqual(MOCK_URL);
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        data: {
          longUrl: "https://new-url.com",
          updatedAt: expect.any(Date),
        },
        where: { shortId: MOCK_URL.shortId },
      });
    });
  });
});
