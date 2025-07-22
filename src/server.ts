import "module-alias/register";
import express, { Response } from "express";
import serverRouter from "./api/v1";
import { ENVS } from "./config/env";
import { HTTP_STATUS } from "./config/http-status";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(serverRouter);

app.use((_, res: Response<APIResponse>) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    data: null,
    error: null,
  });
});

app.listen(ENVS.PORT, (err) => {
  if (err) {
    logger.error("Error starting server:", err);
    return;
  }

  logger.info("Server is running on port", ENVS.PORT);
  logger.info("API V1 available at: /api/v1");
  logger.info("API V1 Documentation available at: /docs/v1");
});
