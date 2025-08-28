import { Url } from "@/generated/prisma";

export const MOCK_URLS: Url[] = [
  {
    clicks: 12,
    createdAt: new Date(),
    expiresAt: null,
    id: "1",
    isDeleted: false,
    longUrl: "https://example.com/1",
    qrCode: "",
    shortId: "shortId1",
    updatedAt: new Date(),
    userId: "user1",
  },
  {
    clicks: 5,
    createdAt: new Date(),
    expiresAt: null,
    id: "2",
    isDeleted: false,
    longUrl: "https://example.com/2",
    qrCode: "",
    shortId: "shortId2",
    updatedAt: new Date(),
    userId: "user2",
  },
  {
    clicks: 8,
    createdAt: new Date(),
    expiresAt: null,
    id: "3",
    isDeleted: false,
    longUrl: "https://example.com/3",
    qrCode: "",
    shortId: "shortId3",
    updatedAt: new Date(),
    userId: "user3",
  },
];

export const MOCK_URL: Url = MOCK_URLS[0];
