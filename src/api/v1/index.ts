import { Router } from "express";

import shortenRoutes from "./shorten/routes";

const v1ApiRouter = Router();

v1ApiRouter.use("/shorten", shortenRoutes);

export default v1ApiRouter;
