import "module-alias/register";

import cors from "cors";
import express, { Response } from "express";

import serverRouter from "./api";
import { ENVS } from "./config/env";
import { HTTP_STATUS } from "./constants/common";
import { ApiErrorResponse } from "./utils/api-error-response";
import { ApiSuccessResponse } from "./utils/api-success-response";

const ALLOWED_ORIGINS = ENVS.CORS_ORIGINS.split(",");

export function createServer(): express.Express {
  const app = express();

  app.use(express.json());
  app.use(serverRouter);
  app.use(
    cors({
      origin: ALLOWED_ORIGINS.map((origin) => origin.trim()),
    }),
  );

  // === Useful Routes

  // Health check route

  app.get("/health", (_, res: Response<APIResponse>) => {
    res.status(HTTP_STATUS.OK).json(new ApiSuccessResponse("Server is healthy").toJSON());
  });

  // Not found route
  app.use((_, res: Response<APIResponse>) => {
    res.status(HTTP_STATUS.NOT_FOUND).json(new ApiErrorResponse("Route not found").toJSON());
  });

  return app;
}
