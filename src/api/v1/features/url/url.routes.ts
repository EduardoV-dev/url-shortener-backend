import { Router } from "express";

import { Url } from "@/generated/prisma";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";
import { RetryImpl } from "@/utils/retry";

import { bypassAuthenticationMiddleware } from "../../middlewares/auth";
import { ReadRepositoryImpl, WriteRepositoryImpl } from "../../repositories";
import { ShortCodeGenerator } from "./short-code-generator";
import { UrlControllerImpl } from "./url.controller";
import { UrlRepositoryImpl } from "./url.repository";
import { urlSchema } from "./url.schemas";
import { UrlServiceImpl } from "./url.service";

const readRepository = new ReadRepositoryImpl<Url>("url");
const writeRepository = new WriteRepositoryImpl<Url>("url");
const repository = new UrlRepositoryImpl(readRepository, writeRepository);

const codeGenerator = new ShortCodeGenerator();
const retry = new RetryImpl();

const service = new UrlServiceImpl({ codeGenerator, repository, retry });
const controller = new UrlControllerImpl(service);

const router = Router();

router
  .get("/redirect/:shortId", controller.redirect)
  .post(
    "",
    bypassAuthenticationMiddleware,
    HttpRequestValidator.validate(urlSchema),
    controller.createUrl,
  );

export default router;

export const urlRoutePath = "/urls";
