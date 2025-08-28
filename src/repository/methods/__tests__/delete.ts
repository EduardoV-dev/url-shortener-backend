import { Url } from "@/generated/prisma";
import { MOCK_URL } from "@/test/__fixtures__/url";
import { prismaMock } from "@/test/__mocks__/prisma";

import { DeleteMethodImpl } from "../delete";

describe("DeleteMethod", () => {
  describe("Delete", () => {
    it("Should delete a record", async () => {
      prismaMock.url.update.mockResolvedValue(MOCK_URL);

      const deleteMethod = new DeleteMethodImpl<Url>(prismaMock.url);
      const result = await deleteMethod.delete({ shortId: MOCK_URL.shortId });

      expect(result).toEqual(MOCK_URL);
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isDeleted: true,
        }),
        where: { shortId: MOCK_URL.shortId },
      });
    });
  });
});
