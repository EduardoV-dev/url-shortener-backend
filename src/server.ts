import "module-alias/register";

import cors from "cors";
import express, { Response } from "express";

import serverRouter from "./api";
import { HTTP_STATUS } from "./config/common";
import { ENVS } from "./config/env";
import { ApiErrorResponse } from "./utils/api-error-response";
import { logger } from "./utils/logger";

const app = express();

const ALLOWED_ORIGINS = ENVS.CORS_ORIGINS.split(",");

app.use(
  cors({
    origin: ALLOWED_ORIGINS.map((origin) => origin.trim()),
  }),
);

app.use(express.json());
app.use(serverRouter);

app.use((_, res: Response<APIResponse>) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(new ApiErrorResponse("Route not found").toJSON());
});

app.listen(ENVS.PORT, (err) => {
  if (err) {
    logger.error("Error starting server:", err);
    return;
  }

  logger.info("Server is running on port\n", ENVS.PORT);
  logger.info("API V1 available at: /api/v1");
  logger.info("API V1 Documentation available at: /docs/v1");
});
