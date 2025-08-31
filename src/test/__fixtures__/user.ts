import { User } from "@/generated/prisma";

export const MOCK_USER: User = {
  createdAt: new Date("2025-08-08T16:23"),
  email: "created@gmail.com",
  id: "1",
  isAdmin: false,
  isDeleted: false,
  password: "hashed-password",
  updatedAt: new Date("2025-08-08T16:23"),
};

export const MOCK_ADMIN_USER: User = {
  createdAt: new Date("2025-08-08T16:23"),
  email: "admin@email.com",
  id: "2",
  isAdmin: true,
  isDeleted: false,
  password: "hashed-password",
  updatedAt: new Date("2025-08-08T16:23"),
};
