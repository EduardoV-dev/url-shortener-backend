import { Request, Response } from "express";

import { HTTP_STATUS } from "@/constants/common";
import { Prisma } from "@/generated/prisma";
import { MOCK_PRISMA_ERRORS, MOCK_RESPONSE_EXPRESS } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";

import { httpErrorHandlerMiddleware } from "../http-error-handler";

describe("Error Handler Middleware (httpErrorHandlerMiddleware)", () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      method: "GET",
      originalUrl: "/test",
    } as Request;
    res = MOCK_RESPONSE_EXPRESS;
    next = jest.fn();
  });

  describe("PrismaClientKnownRequestError", () => {
    it("Handles VALUE_TOO_LONG error", () => {
      httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.VALUE_TOO_LONG, req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it("Handles UNIQUE_CONSTRAINT_FAILED error", () => {
      httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED, req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it("Handles FOREIGN_KEY_CONSTRAINT_FAILED error", () => {
      httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.FOREIGN_KEY_CONSTRAINT_FAILED, req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it("Handles RECORD_NOT_FOUND error", () => {
      httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.RECORD_NOT_FOUND, req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it("Handles unknown PrismaClientKnownRequestError", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Unknown error", {
        code: "UNKNOWN_ERROR",
        clientVersion: "",
      });

      httpErrorHandlerMiddleware(prismaError, req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });
  });

  it("Handles PrismaClientValidationError", () => {
    httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.CLIENT_VALIDATION_ERROR, req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("Handles PrismaClientInitializationError", () => {
    httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.CLIENT_INITIALIZATION_ERROR, req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("Handles PrismaClientRustPanicError", () => {
    httpErrorHandlerMiddleware(MOCK_PRISMA_ERRORS.CLIENT_RUST_PANIC_ERROR, req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("Handles unknown error", () => {
    const unknownError = new Error("Unknown error");
    httpErrorHandlerMiddleware(unknownError, req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("Calls res.status and res.json once", () => {
    httpErrorHandlerMiddleware(new Error("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it("Handles custom ApiError instances", () => {
    httpErrorHandlerMiddleware(
      new ApiError("Custom error").setStatus(HTTP_STATUS.UNAUTHORIZED),
      req,
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Custom error",
      }),
    );
  });
});
