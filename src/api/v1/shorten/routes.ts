import { Router } from "express";

import { HttpRequestValidator } from "@/middlewares/http-request-validator";

import { UrlShortenerController } from "./controller";
import { UrlShortenerRepository } from "./repository";
import { UrlShortenerService } from "./service";
import { ShortCodeGenerator } from "./utils";
import { urlSchema } from "./validations";

const repo = new UrlShortenerRepository();
const shortCodeGenerator = new ShortCodeGenerator();
const service = new UrlShortenerService(repo, shortCodeGenerator);
const controller = new UrlShortenerController(service);

const router = Router();

router.post("", new HttpRequestValidator(urlSchema).validate, controller.createUrl);

export default router;
