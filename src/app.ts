import { ENVS } from "./config/env";
import { createServer } from "./server";
import { logger } from "./utils/logger";

const app = createServer();

app.listen(ENVS.PORT, (err) => {
  if (err) {
    logger.error("Error starting server:", err);
    return;
  }

  logger.info(`Server is running on port: ${ENVS.PORT}`);
  logger.info("API available at: /api");
  logger.info("API Documentation available at: /docs");
});
