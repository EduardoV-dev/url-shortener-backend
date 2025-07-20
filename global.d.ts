/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: "development" | "production";
  }
}

declare global {
  type ControllerMethod<
    Params = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
  > = (
    req: Request<Params, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
  ) => Promise<void>;

  interface ServiceResponse<T> {
    message: string;
    data: T | null;
  }

  interface APIResponse<T> extends ServiceResponse<T> {
    error: ServiceResponse<unknown> | null;
  }
}
