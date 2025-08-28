import "module-alias/register";

import cors from "cors";
import express, { Response } from "express";

import router from "./api";
import { ENVS } from "./config/env";
import { HTTP_STATUS } from "./constants/common";
import { httpErrorHandlerMiddleware } from "./middlewares/http-error-handler";
import { ApiErrorResponse } from "./utils/api-error-response";
import { ApiSuccessResponse } from "./utils/api-success-response";

const ALLOWED_ORIGINS = ENVS.CORS_ORIGINS.split(",");

export const createServer = (): express.Express => {
  const app = express();

  app.use(express.json());
  app.use(router);
  app.use(
    cors({
      origin: ALLOWED_ORIGINS.map((origin) => origin.trim()),
    }),
  );

  // === Useful Routes

  // Health check route

  app.get("/health", (_, res: Response<APIResponse>) => {
    const SECONDS_TO_MINUTES = 60;
    const SECONDS_TO_HOURS = 3600;
    const SECONDS_TO_DAYS = 86400;

    const uptime = {
      real: process.uptime(),
      seconds: Math.floor(process.uptime()),
      minutes: Math.floor(process.uptime() / SECONDS_TO_MINUTES),
      hours: Math.floor(process.uptime() / SECONDS_TO_HOURS),
      days: Math.floor(process.uptime() / SECONDS_TO_DAYS),
    };

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiSuccessResponse("Server is healthy", { uptime }).toJSON());
  });

  // Not found route
  app.use((_, res: Response<APIResponse>) => {
    res.status(HTTP_STATUS.NOT_FOUND).json(new ApiErrorResponse("Route not found").toJSON());
  });

  // Error handler middleware

  app.use(httpErrorHandlerMiddleware);

  return app;
};
