import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ENVS } from "@/config/env";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";

type JwtPayload = Pick<User, "id" | "email">;

const TOKEN_EXPIRED_ERROR = new ApiError("Token is expired").setStatus(HTTP_STATUS.UNAUTHORIZED);

/**
 * Middleware to authenticate requests using JWT tokens.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies it, and attaches the user ID to the request object.
 * If the token is missing or invalid, it responds with a 401 Unauthorized status.
 */
export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(new ApiErrorResponse("Unauthorized").toJSON());

  try {
    const { id } = jwt.verify(token, ENVS.JWT_SECRET) as JwtPayload;
    req.userId = id;
    return next();
  } catch (err) {
    next(TOKEN_EXPIRED_ERROR);
  }
};

/**
 * Middleware to optionally authenticate requests using JWT tokens.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies it if present, and attaches the user ID to the request object.
 * If the token is missing, it sets userId to an empty string.
 * If the token is invalid, it sets userId to undefined.
 * In all cases, it proceeds to the next middleware or route handler.
 */
export const bypassAuthenticationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.header("Authorization")?.replace("Bearer ", "");
  req.userId = undefined;

  if (!token) return next();

  try {
    const { id } = jwt.verify(token, ENVS.JWT_SECRET) as JwtPayload;
    req.userId = id;
    return next();
  } catch (error) {
    return next(TOKEN_EXPIRED_ERROR);
  }
};
