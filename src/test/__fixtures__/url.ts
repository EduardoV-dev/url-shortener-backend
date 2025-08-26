import { Url } from "@/generated/prisma";

export const MOCK_URLS: Url[] = [
  {
    id: "1",
    longUrl: "https://example.com/1",
    createdAt: new Date(),
    shortId: "shortId1",
    userId: "user1",
  },
  {
    id: "2",
    longUrl: "https://example.com/2",
    createdAt: new Date(),
    shortId: "shortId2",
    userId: "user2",
  },
  {
    id: "3",
    longUrl: "https://example.com/3",
    createdAt: new Date(),
    shortId: "shortId3",
    userId: "user3",
  },
];

export const MOCK_URL: Url = MOCK_URLS[0];
