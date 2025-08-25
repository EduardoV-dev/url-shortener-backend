import { PrismaClient } from "../../../src/generated/prisma";
import { URLS } from "./data/urls";
import { USERS } from "./data/users";

const prisma = new PrismaClient();

const createUsers = async () => {
  console.log("Creating users...");

  await prisma.user.createMany({
    data: USERS,
  });

  const users = await prisma.user.findMany();
  const usersId = users.map((user) => user.id);

  return usersId;
};

const URLS_FOR_USERS = URLS.slice(0, 50);
const URLS_PER_USER = 10;

const URLS_FOR_ANONYMOUS = URLS.slice(50, 80);

const createUrlsWithUserIds = async (usersId: string[]) => {
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

const createAnonymousUrls = async () => {
  console.log("Creating URLs for anonymous users...");
  await prisma.url.createMany({
    data: URLS_FOR_ANONYMOUS,
  });
};

export const seedV1 = async () => {
  try {
    const usersId = await createUsers();
    await Promise.all([createUrlsWithUserIds(usersId), createAnonymousUrls()]);
    console.log("Database seeded successfully with v1 data.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    prisma.$disconnect();
  }
};
