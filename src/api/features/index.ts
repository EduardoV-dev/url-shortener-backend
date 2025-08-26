import { Router } from "express";

import authRouter, { authRoutePath } from "./auth/auth.routes";
import urlRouter, { urlRoutePath } from "./url/url.routes";

const apiRouter = Router();

apiRouter.use(authRoutePath, authRouter);
apiRouter.use(urlRoutePath, urlRouter);

export default apiRouter;
