import { Router } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { MORGAN_SETTING } from "@/constants/common";

import apiRouter from "./features";

const router = Router();
const swaggerDocument = YAML.load("./src/api/openapi.yaml");

router.use(morgan(MORGAN_SETTING));

router.use("/api", apiRouter);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
