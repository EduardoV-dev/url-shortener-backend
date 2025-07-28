import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger.config";
import urlShortenerRoutes from "./url-shortener/routes";

const v1ApiRouter = Router();
v1ApiRouter.use("/shorten", urlShortenerRoutes);

const serverRouter = Router();

serverRouter.use("/api/v1", v1ApiRouter);
serverRouter.use("/docs/v1", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default serverRouter;
