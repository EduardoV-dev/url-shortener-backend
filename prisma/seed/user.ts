import { PrismaClient } from "@/generated/prisma";

import { USERS } from "./data/users";

export const createUsers = async (prisma: PrismaClient) => {
  console.log("Creating users...");

  await prisma.user.createMany({
    data: USERS,
  });

  const users = await prisma.user.findMany();
  const usersId = users.map((user) => user.id);

  return usersId;
};
