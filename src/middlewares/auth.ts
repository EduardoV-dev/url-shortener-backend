import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ENVS } from "@/config/env";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";

type JwtPayload = Pick<User, "id" | "email" | "isAdmin">;

export const TOKEN_EXPIRED_ERROR = new ApiError("Token is expired", {
  status: HTTP_STATUS.UNAUTHORIZED,
});

/**
 * Middleware to authenticate requests using JWT tokens.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies it, and attaches the user ID to the request object.
 * If the token is missing or invalid, it responds with a 401 Unauthorized status.
 */
export const jwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtPayload = verifyToken(req);

    if (!jwtPayload)
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        new ApiErrorResponse("Unauthorized", {
          Authorization: "Authorization header not specified",
        }).toJSON(),
      );

    next();
  } catch (error) {
    next(error);
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
export const optionalJwtAuthGuard = (req: Request, _res: Response, next: NextFunction) => {
  try {
    verifyToken(req);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authenticate admin users using JWT tokens.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies it, and checks if the user has admin privileges.
 * If the token is missing, invalid, or the user is not an admin,
 * it responds with appropriate error messages and status codes.
 */
export const adminJwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtPayload = verifyToken(req);

    if (!jwtPayload)
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        new ApiErrorResponse("Unauthorized", {
          Authorization: "Authorization header not specified",
        }).toJSON(),
      );

    if (!jwtPayload.isAdmin)
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(new ApiErrorResponse("Admin user needed to access this resource").toJSON());

    next();
  } catch (error) {
    next(error);
  }
};

const verifyToken = (req: Request): JwtPayload | null => {
  req.userId = undefined;

  const token: string | undefined = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const payload = jwt.verify(token, ENVS.JWT_SECRET) as JwtPayload;
    req.userId = payload.id;
    return payload;
  } catch (error) {
    throw TOKEN_EXPIRED_ERROR;
  }
};
