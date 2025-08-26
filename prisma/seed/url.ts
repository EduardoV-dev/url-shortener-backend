import { PrismaClient } from "@/generated/prisma";

import { URLS } from "./data/urls";

const URLS_FOR_USERS = URLS.slice(0, 50);
const URLS_PER_USER = 10;
const URLS_FOR_ANONYMOUS = URLS.slice(50, 80);

export const createUrlsWithUserIds = async (prisma: PrismaClient, usersId: string[]) => {
  console.log("Creating URLs for users...");

  usersId.forEach(async (userId, index) => {
    const start = index * URLS_PER_USER;
    const end = start + URLS_PER_USER;

    await prisma.url.createMany({
      data: URLS_FOR_USERS.slice(start, end).map((url) => ({
        ...url,
        userId,
      })),
    });
  });
};

export const createAnonymousUrls = async (prisma: PrismaClient) => {
  console.log("Creating URLs for anonymous users...");
  await prisma.url.createMany({
    data: URLS_FOR_ANONYMOUS,
  });
};
