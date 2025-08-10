import { Router } from "express";

import { User } from "@/generated/prisma";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";

import { ReadRepositoryImpl, RepositoryImpl, WriteRepositoryImpl } from "../../repositories";
import { UserServiceImpl } from "../user";
import { AuthControllerImpl } from "./auth.controller";
import { authCreationSchema, authLoginSchema } from "./auth.schemas";
import { AuthServiceImpl } from "./auth.service";

const router = Router();

const readRepo = new ReadRepositoryImpl<User>("user");
const writeRepo = new WriteRepositoryImpl<User>("user");

const userRepo = new RepositoryImpl<User>(readRepo, writeRepo);
const userService = new UserServiceImpl(userRepo);
const authService = new AuthServiceImpl(userService);

const authController = new AuthControllerImpl(authService);

router
  .post("/register", HttpRequestValidator.validate(authCreationSchema), authController.signup)
  .post("/login", HttpRequestValidator.validate(authLoginSchema), authController.login);

export default router;

export const authRoutePath = "/auth";
