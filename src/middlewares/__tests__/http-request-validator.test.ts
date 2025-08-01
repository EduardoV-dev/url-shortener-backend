import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { HttpRequestValidator } from "../http-request-validator";

jest.mock("@/config/common", () => ({
  HTTP_STATUS: { BAD_REQUEST: 400 },
}));

describe("HttpRequestValidator middleware", () => {
  let next: jest.MockedFunction<NextFunction>;
  let res: Pick<Response, "status" | "json"> & { status: jest.Mock; json: jest.Mock };
  let req: Pick<Request, "body">;
  let validator: HttpRequestValidator;

  beforeEach(() => {
    jest.clearAllMocks();

    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    validator = new HttpRequestValidator(
      z.object({ foo: z.string({ required_error: "Some error" }) }),
    );
  });

  describe("validate method", () => {
    it("calls next() if validation passes", async () => {
      req = { body: { foo: "bar" } };
      await validator.validate(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("returns 400 and error details if validation fails", async () => {
      req = { body: {} };
      await validator.validate(req as Request, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
          error: { foo: expect.any(String) },
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("groupErrors method", () => {
    it("groups validation errors correctly", () => {
      const errors = new z.ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          message: "Message",
          path: ["foo"],
        },
        {
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          message: "Some error",
          path: ["bar"],
        },
      ]);

      const grouped = validator.groupErrors(errors);

      expect(grouped).toEqual({
        foo: "Message",
        bar: "Some error",
      });
    });

    it("defaults fields with no error messages to an empty string", () => {
      const errors = {
        flatten: () => ({
          fieldErrors: { foo: ["Some error"], bar: undefined },
        }),
      } as unknown as z.ZodError;

      const grouped = validator.groupErrors(errors);
      expect(grouped).toEqual({ foo: "Some error" });
    });

    it("skips fields with empty error messages in groupErrors", () => {
      const errors = {
        flatten: () => ({
          fieldErrors: { foo: ["Some error"], bar: [""] },
        }),
      } as unknown as z.ZodError;

      const grouped = validator.groupErrors(errors);
      expect(grouped).toEqual({ foo: "Some error" }); // 'bar' is skipped
    });
  });
});
