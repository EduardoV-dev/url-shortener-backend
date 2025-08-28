import { Url } from "@/generated/prisma";

export const MOCK_URLS: Url[] = [
  {
    createdAt: new Date(),
    id: "1",
    isDeleted: false,
    longUrl: "https://example.com/1",
    shortId: "shortId1",
    updatedAt: new Date(),
    userId: "user1",
  },
  {
    createdAt: new Date(),
    id: "2",
    isDeleted: false,
    longUrl: "https://example.com/2",
    shortId: "shortId2",
    updatedAt: new Date(),
    userId: "user2",
  },
  {
    createdAt: new Date(),
    id: "3",
    isDeleted: false,
    longUrl: "https://example.com/3",
    shortId: "shortId3",
    updatedAt: new Date(),
    userId: "user3",
  },
];

export const MOCK_URL: Url = MOCK_URLS[0];
