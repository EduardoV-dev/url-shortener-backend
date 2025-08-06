import { Router } from "express";

import { authRoutePath, authRouter, shortenRoutePath, shortenRouter } from "./features";

const v1ApiRouter = Router();

v1ApiRouter.use(shortenRoutePath, shortenRouter);
v1ApiRouter.use(authRoutePath, authRouter);

export default v1ApiRouter;
