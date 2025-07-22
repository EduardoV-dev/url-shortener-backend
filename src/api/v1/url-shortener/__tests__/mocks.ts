import { Url } from "@/generated/prisma";

export const mockUrl: Readonly<Url> = {
  clickCount: 0,
  createdAt: new Date(),
  id: 1,
  originalUrl: "https://example.com",
  shortCode: "test-code",
  updatedAt: new Date(),
};
