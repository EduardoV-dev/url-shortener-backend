import { Router } from "express";

import urlShortenerRoutes from "./url-shortener/routes";

const v1ApiRouter = Router();
v1ApiRouter.use("/shorten", urlShortenerRoutes);

const serverRouter = Router();
serverRouter.use("/api/v1", v1ApiRouter);

export default serverRouter;
