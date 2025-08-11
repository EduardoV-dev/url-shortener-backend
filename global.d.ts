/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
// eslint-disable-next-line import/no-unresolved
import { ParamsDictionary } from "express-serve-static-core";

interface AuthContext {
  userId?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CORS_ORIGINS: string | undefined;
      DATABASE_URL: string | undefined;
      JWT_SECRET: string | undefined;
      LOG_LEVEL: string | undefined;
      NODE_ENV: "development" | "production" | "test" | undefined;
      PORT: string | undefined;
    }
  }

  type ControllerMethod<
    Params extends ParamsDictionary = ParamsDictionary,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
  > = (
    req: Request<Params, APIResponse, ReqBody, ReqQuery, Locals> & AuthContext,
    res: Response<APIResponse, Locals>,
    next: NextFunction,
  ) => Promise<void>;

  interface APIResponse {
    success: boolean;
    message: string;
    data: unknown | null;
    error: unknown | null;
  }
}
