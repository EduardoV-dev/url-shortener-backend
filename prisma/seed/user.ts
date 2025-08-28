import bcrypt from "bcrypt";

import { ENVS } from "../../src/config/env";
import { PrismaClient } from "../../src/generated/prisma";
import { USERS } from "./data/users";

export const createUsers = async (prisma: PrismaClient): Promise<string[]> => {
  console.log("Creating users...");

  const usersToCreate = [...USERS];

  for (const user of usersToCreate) {
    user.password = await bcrypt.hash(user.password, ENVS.BCRYPT_SALT_ROUNDS);
  }

  await prisma.user.createMany({
    data: usersToCreate,
  });

  const users = await prisma.user.findMany();
  const usersIds = users.map((user) => user.id);

  return usersIds;
};
