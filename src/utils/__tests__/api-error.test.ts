import { HTTP_STATUS } from "@/constants/common";

import { ApiError } from "../api-error";

describe("ApiError", () => {
  it("should set name, message, default code, status, and timestamp", () => {
    const err = new ApiError("fail");

    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("fail");
    expect(err.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(err.code).toBe("API_ERROR");
    expect(new Date(err.timestamp)).toBeInstanceOf(Date);
  });

  it("should set details and be chainable", () => {
    const err = new ApiError("fail", { details: { foo: "bar" } });

    expect(err.details).toEqual({ foo: "bar" });
    expect(err).toBeInstanceOf(ApiError);
  });

  it("should set status and be chainable", () => {
    const err = new ApiError("fail", { status: 404 });

    expect(err.status).toBe(404);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("should set code and be chainable", () => {
    const err = new ApiError("fail", { code: "CUSTOM_ERROR" });

    expect(err.code).toBe("CUSTOM_ERROR");
    expect(err).toBeInstanceOf(ApiError);
  });

  it("should serialize to correct JSON structure", () => {
    const err = new ApiError("fail", { code: "CODE", details: { foo: "bar" }, status: 400 });

    expect(err.toJSON()).toEqual({
      code: "CODE",
      details: { foo: "bar" },
      message: "fail",
      name: "ApiError",
      status: 400,
      timestamp: expect.any(String),
    });
  });
});
