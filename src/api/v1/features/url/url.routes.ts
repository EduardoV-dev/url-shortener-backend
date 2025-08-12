import { Router } from "express";

import { Url } from "@/generated/prisma";
import { HttpRequestValidator } from "@/middlewares/http-request-validator";
import { RetryImpl } from "@/utils/retry";

import { bypassAuthenticationMiddleware } from "../../middlewares/auth";
import { ReadRepositoryImpl, WriteRepositoryImpl } from "../../repositories";
import { ShortCodeGenerator } from "./short-code-generator";
import { ShortenControllerImpl } from "./url.controller";
import { ShortenRepositoryImpl } from "./url.repository";
import { urlSchema } from "./url.schemas";
import { ShortenServiceImpl } from "./url.service";

const readRepository = new ReadRepositoryImpl<Url>("url");
const writeRepository = new WriteRepositoryImpl<Url>("url");
const repository = new ShortenRepositoryImpl(readRepository, writeRepository);

const codeGenerator = new ShortCodeGenerator();
const retry = new RetryImpl();

const service = new ShortenServiceImpl({ codeGenerator, repository, retry });
const controller = new ShortenControllerImpl(service);

const router = Router();

router.post(
  "",
  bypassAuthenticationMiddleware,
  HttpRequestValidator.validate(urlSchema),
  controller.createUrl,
);

export default router;

export const urlRoutePath = "/urls";
