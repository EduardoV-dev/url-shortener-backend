/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

declare namespace NodeJS {
  interface ProcessEnv {
    CORS_ORIGINS: string;
    DATABASE_URL: string;
    NODE_ENV: "development" | "test" | "production";
    PORT: string;
    SWAGGER_SERVER_V1: string;
  }
}

declare global {
  type ControllerMethod<
    Params = ParamsDictionary,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
  > = (
    req: Request<Params, APIResponse, ReqBody, ReqQuery, Locals>,
    res: Response<APIResponse, Locals>,
  ) => Promise<void>;

  interface APIResponse {
    success: boolean;
    message: string;
    data: unknown | null;
    error: unknown | null;
  }
}
