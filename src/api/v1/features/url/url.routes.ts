import { Router } from "express";

import { HttpRequestValidator } from "@/middlewares/http-request-validator";
import { prisma } from "@/storage/prisma";
import { RetryImpl } from "@/utils/retry";

import { authenticationMiddleware, bypassAuthenticationMiddleware } from "../../middlewares/auth";
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
  .get("", authenticationMiddleware, controller.getUrlsByUserId)
  .get("/redirect/:shortId", controller.redirect)
  .post(
    "",
    bypassAuthenticationMiddleware,
    HttpRequestValidator.validate(urlSchema),
    controller.createUrl,
  );

export default router;

export const urlRoutePath = "/urls";
