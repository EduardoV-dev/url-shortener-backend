import { Url } from "@/generated/prisma";
import { prismaMock } from "@/test/prisma-mock";

import { DeleteMethodImpl } from "../delete";

describe("DeleteMethod", () => {
  describe("Delete", () => {
    it("Should delete a record", async () => {
      // TODO: Place the mock somewhere else, the issue is that the url mocks are in v1
      const mockResponse: Url = {
        createdAt: new Date(),
        id: "1",
        longUrl: "https://example.com",
        shortId: "1",
        userId: "user1",
      };

      prismaMock.url.delete.mockResolvedValue(mockResponse);

      const deleteMethod = new DeleteMethodImpl<Url>(prismaMock.url);
      const result = await deleteMethod.delete({ shortId: mockResponse.shortId });

      expect(result).toEqual(mockResponse);
      expect(prismaMock.url.delete).toHaveBeenCalledWith({
        where: { shortId: mockResponse.shortId },
      });
    });
  });
});
