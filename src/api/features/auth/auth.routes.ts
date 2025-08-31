import { Router } from "express";

import { prisma } from "@/libs/prisma";
import { adminJwtAuthGuard } from "@/middlewares/auth";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";

import { UserRepositoryImpl, UserServiceImpl } from "../user";
import { AuthControllerImpl } from "./auth.controller";
import { authCreationSchema, authLoginSchema } from "./auth.schemas";
import { AuthServiceImpl } from "./auth.service";

const router = Router();

const userRepo = new UserRepositoryImpl(prisma);
const userService = new UserServiceImpl(userRepo);
const authService = new AuthServiceImpl(userService);

const authController = new AuthControllerImpl(authService);

router
  .post(
    "/register",
    HttpRequestValidator.validate(authCreationSchema),
    authController.signup(false),
  )
  .post(
    "/admin",
    HttpRequestValidator.validate(authCreationSchema),
    adminJwtAuthGuard,
    authController.signup(true),
  )
  .post("/login", HttpRequestValidator.validate(authLoginSchema), authController.login);

export default router;

export const authRoutePath = "/auth";
