import "module-alias/register";
import express, { Response } from "express";
import serverRouter from "./api/v1";
import { ENVS } from "./config/env";

const app = express();

app.use(express.json());
app.use(serverRouter);

app.use((_, res: Response<APIResponse<unknown>>) => {
  res.status(200).json({
    message: "",
    data: null,
    error: { message: "Route does not exist", data: null },
  });
});

app.listen(ENVS.PORT, () => console.log(`Server running on port ${ENVS.PORT}`));
