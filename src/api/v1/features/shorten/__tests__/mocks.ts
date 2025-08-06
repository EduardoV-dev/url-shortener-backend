import { Url } from "@/generated/prisma";

export const MOCK_URL: Readonly<Url> = {
  createdAt: new Date("2023-01-01T00:00:00Z"),
  id: "mock-id",
  longUrl: "https://example.com/long-url",
  shortId: "short-id",
  userId: null,
};
