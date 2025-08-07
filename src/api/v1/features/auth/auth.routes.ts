import { Router } from "express";

import { User } from "@/generated/prisma";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";

import { ReadRepositoryImpl, WriteRepositoryImpl } from "../../repositories";
import { UserRepositoryImpl, UserServiceImpl } from "../user";
import { AuthControllerImpl } from "./auth.controller";
import { authCreationSchema } from "./auth.schemas";

const router = Router();

const readRepo = new ReadRepositoryImpl<User>("user");
const writeRepo = new WriteRepositoryImpl<User>("user");
const userRepository = new UserRepositoryImpl(readRepo, writeRepo);

const userService = new UserServiceImpl(userRepository);
const authController = new AuthControllerImpl(userService);

router.post(
  "/register",
  new HttpRequestValidator(authCreationSchema).validate,
  authController.signup,
);

export default router;

export const authRoutePath = "/auth";
