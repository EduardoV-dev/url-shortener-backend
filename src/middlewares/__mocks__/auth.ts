import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@/constants/common";
import { MOCK_URL } from "@/test/__fixtures__/url";
import { ApiErrorResponse } from "@/utils/api-error-response";

export const optionalJwtAuthGuard = (req: Request, _res: Response, next: NextFunction) => {
  if (req.header("Authorization") === "validToken") req.userId = MOCK_URL.userId || "";
  else req.userId = undefined;
  next();
};

export const jwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.header("Authorization") !== "validToken")
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(new ApiErrorResponse("Unauthorized").toJSON());
  else req.userId = "valid-user-id";
  next();
};

export const adminJwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.header("Authorization") !== "validAdminToken")
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(new ApiErrorResponse("Admin user needed to access this resource").toJSON());
  else req.userId = "valid-admin-user-id";
  next();
};
