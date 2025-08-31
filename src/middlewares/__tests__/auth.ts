import { NextFunction, Request, Response } from "express";

import { MOCK_RESPONSE_EXPRESS } from "@/test/__mocks__/common";

import {
  adminJwtAuthGuard,
  jwtAuthGuard,
  optionalJwtAuthGuard,
  TOKEN_EXPIRED_ERROR,
} from "../auth";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockImplementation((token: string) => {
    switch (token) {
      case "invalidToken":
        throw new Error("Invalid token");
      case "expiredToken":
        throw new Error("TokenExpiredError");
      case "validAdminToken":
        return { id: "1234", email: "email2@valid.com", isAdmin: true };
      default:
        return { id: "123", email: "email@valid.com", isAdmin: false };
    }
  }),
}));

describe("Auth Middlewares", () => {
  let req: Request;
  let res: jest.Mocked<Response>;
  let next: jest.Mocked<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();

    res = MOCK_RESPONSE_EXPRESS;
    next = jest.fn();
  });

  describe("jwtAuthGuard", () => {
    it("should authenticate valid JWT token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validToken"),
      } as unknown as Request;

      jwtAuthGuard(req, res, next);

      expect(req.userId).toBeDefined();
      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("Should return 401 for missing token", () => {
      req = {
        header: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      jwtAuthGuard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid JWT token (expired)", () => {
      req = {
        header: jest.fn().mockReturnValue(`Bearer expiredToken`),
      } as unknown as Request;

      jwtAuthGuard(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith(TOKEN_EXPIRED_ERROR);
    });
  });

  describe("optionalJwtAuthGuard", () => {
    it("should set userId to undefined when no token is provided", () => {
      req = {
        header: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      optionalJwtAuthGuard(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it("Should set userId to valid ID for valid token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validToken"),
      } as unknown as Request;

      optionalJwtAuthGuard(req, res, next);

      expect(req.userId).toBe("123");
      expect(next).toHaveBeenCalled();
    });

    it("Should return a response that token is not valid if it's expired", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer expiredToken"),
      } as unknown as Request;

      optionalJwtAuthGuard(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("adminJwtAuthGuard", () => {
    it("should authenticate valid JWT token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validAdminToken"),
      } as unknown as Request;

      adminJwtAuthGuard(req, res, next);

      expect(req.userId).toBeDefined();
      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("Should return 401 for missing token", () => {
      req = {
        header: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      adminJwtAuthGuard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid JWT token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer invalidToken"),
      } as unknown as Request;

      adminJwtAuthGuard(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith(TOKEN_EXPIRED_ERROR);
    });

    it("Should return 403 for user not being admin", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validToken"),
      } as unknown as Request;

      adminJwtAuthGuard(req, res, next);

      expect(req.userId).toBe("123");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
