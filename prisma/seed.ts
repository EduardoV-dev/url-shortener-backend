import { prisma } from "../src/libs/prisma";
import { createAnonymousUrls, createUrlsWithUserIds } from "./seed/url";
import { createUsers } from "./seed/user";

const seedDb = async () => {
  try {
    const usersId = await createUsers(prisma);
    await Promise.all([createUrlsWithUserIds(prisma, usersId), createAnonymousUrls(prisma)]);

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    prisma.$disconnect();
  }
};

seedDb();
