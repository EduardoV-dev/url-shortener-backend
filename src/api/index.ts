import { Router } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { MORGAN_SETTING } from "@/config/common";

import v1ApiRouter from "./v1";

const serverRouter = Router();
const swaggerDocument = YAML.load("./src/api/v1/openapi.yaml");

serverRouter.use(morgan(MORGAN_SETTING));

serverRouter.use("/api/v1", v1ApiRouter);
serverRouter.use("/docs/v1", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default serverRouter;
