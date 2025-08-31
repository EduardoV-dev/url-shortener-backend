import { Router } from "express";

import { prisma } from "@/libs/prisma";
import { jwtAuthGuard, optionalJwtAuthGuard } from "@/middlewares/auth";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";
import { RetryImpl } from "@/utils/retry";

import { ShortCodeGenerator } from "./short-code-generator";
import { UrlControllerImpl } from "./url.controller";
import { UrlRepositoryImpl } from "./url.repository";
import { urlSchema } from "./url.schemas";
import { UrlServiceImpl } from "./url.service";

const repository = new UrlRepositoryImpl(prisma);

const codeGenerator = new ShortCodeGenerator();
const retry = new RetryImpl();

const service = new UrlServiceImpl({ codeGenerator, repository, retry });
const controller = new UrlControllerImpl(service);

const router = Router();

router
  .delete("/:shortId", jwtAuthGuard, controller.deleteUrl)
  .get("", jwtAuthGuard, controller.getUrlsByUserId)
  .get("/redirect/:shortId", controller.redirect)
  .post("", optionalJwtAuthGuard, HttpRequestValidator.validate(urlSchema), controller.createUrl);

export default router;

export const urlRoutePath = "/urls";
