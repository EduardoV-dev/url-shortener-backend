import { ENVS } from "./config/env";
import { createServer } from "./server";
import { logger } from "./utils/logger";

const app = createServer();

app.listen(ENVS.PORT, (err) => {
  if (err) {
    logger.error("Error starting server:", err);
    return;
  }

  logger.info("Server is running on port\n", ENVS.PORT);
  logger.info("API V1 available at: /api/v1");
  logger.info("API V1 Documentation available at: /docs/v1");
});
