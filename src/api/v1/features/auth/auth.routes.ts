import { Router } from "express";

import { HttpRequestValidator } from "@/middlewares/http-request-validator";

import { UserRepositoryImpl, UserServiceImpl } from "../user";
import { AuthControllerImpl } from "./auth.controller";
import { authCreationSchema } from "./auth.schemas";

const router = Router();

const userRepository = new UserRepositoryImpl();
const userService = new UserServiceImpl(userRepository);
const authController = new AuthControllerImpl(userService);

router.post(
  "/register",
  new HttpRequestValidator(authCreationSchema).validate,
  authController.signup,
);

export default router;

export const authRoutePath = "/auth";
