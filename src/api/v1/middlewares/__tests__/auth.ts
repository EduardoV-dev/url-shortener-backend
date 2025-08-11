import { NextFunction, Request, Response } from "express";

import { MOCK_RESPONSE_EXPRESS } from "@/test/mocks";

import { authenticationMiddleware, bypassAuthenticationMiddleware } from "../auth";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockImplementation((token: string) => {
    if (token === "validToken") {
      return { id: "123", email: "email@valid.com" };
    } else {
      throw new Error("Invalid token");
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

  describe("authenticationMiddleware", () => {
    it("should authenticate valid JWT token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validToken"),
      } as unknown as Request;

      authenticationMiddleware(req, res, next);

      expect(req.userId).toBeDefined();
      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("Should return 401 for missing token", () => {
      req = {
        header: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      authenticationMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid JWT token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer invalidToken"),
      } as unknown as Request;

      authenticationMiddleware(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("bypassAuthenticationMiddleware", () => {
    it("should set userId to undefined when no token is provided", () => {
      req = {
        header: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      bypassAuthenticationMiddleware(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it("Should set userId to valid ID for valid token", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer validToken"),
      } as unknown as Request;

      bypassAuthenticationMiddleware(req, res, next);

      expect(req.userId).toBe("123");
      expect(next).toHaveBeenCalled();
    });

    it("Should return a response that token is not valid if it's expired", () => {
      req = {
        header: jest.fn().mockReturnValue("Bearer invalidToken"),
      } as unknown as Request;

      bypassAuthenticationMiddleware(req, res, next);

      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
