import "module-alias/register";
import express, { Response } from "express";
import serverRouter from "./api/v1";
import { ENVS } from "./config/env";
import { HTTP_STATUS } from "./config/http-status";

const app = express();

app.use(express.json());
app.use(serverRouter);

app.use((_, res: Response<APIResponse>) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    data: null,
    error: null,
  });
});

app.listen(ENVS.PORT, () => console.log(`Server running on port ${ENVS.PORT}`));
