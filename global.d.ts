/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CORS_ORIGINS: string | undefined;
      DATABASE_URL: string | undefined;
      LOG_LEVEL: string | undefined;
      NODE_ENV: "development" | "production" | "test" | undefined;
      PORT: string | undefined;
    }
  }
  type ControllerMethod<
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
  > = (
    req: Request<ParamsDictionary, APIResponse, ReqBody, ReqQuery, Locals>,
    res: Response<APIResponse, Locals>,
  ) => Promise<void>;

  interface APIResponse {
    success: boolean;
    message: string;
    data: unknown | null;
    error: unknown | null;
  }
}
