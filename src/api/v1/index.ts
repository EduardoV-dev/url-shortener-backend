import { Router } from "express";

import { authRoutePath, authRouter, urlRoutePath, urlRouter } from "./features";

const v1ApiRouter = Router();

v1ApiRouter.use(urlRoutePath, urlRouter);
v1ApiRouter.use(authRoutePath, authRouter);

export default v1ApiRouter;
