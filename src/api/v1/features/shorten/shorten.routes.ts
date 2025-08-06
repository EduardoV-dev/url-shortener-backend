import { Router } from "express";

import { HttpRequestValidator } from "@/middlewares/http-request-validator";
import { RetryImpl } from "@/utils/retry";

import { ShortCodeGenerator } from "./short-code-generator";
import { ShortenControllerImpl } from "./shorten.controller";
import { ShortenRepositoryImpl } from "./shorten.repository";
import { urlSchema } from "./shorten.schemas";
import { ShortenServiceImpl } from "./shorten.service";

const repository = new ShortenRepositoryImpl();
const codeGenerator = new ShortCodeGenerator();
const retry = new RetryImpl();
const service = new ShortenServiceImpl({ codeGenerator, repository, retry });
const controller = new ShortenControllerImpl(service);

const router = Router();

router.post("", new HttpRequestValidator(urlSchema).validate, controller.createUrl);

export default router;

export const shortenRoutePath = "/shorten";
