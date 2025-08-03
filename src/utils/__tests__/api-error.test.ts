import { HTTP_STATUS } from "@/constants/common";

import { ApiError, DEFAULT_ERROR_CODE } from "../api-error";

describe("ApiError", () => {
  it("Set default values", () => {
    const err = new ApiError("An error occurred");
    expect(err.toJSON()).toEqual({
      code: DEFAULT_ERROR_CODE,
      details: null,
      message: "An error occurred",
      name: "ApiError",
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
    });
  });

  it("Sets code correctly and defaults the rest", () => {
    const err = new ApiError("An error occurred", { code: "CUSTOM_ERROR" });
    expect(err.code).toBe("CUSTOM_ERROR");
    expect(err.toJSON()).toEqual({
      code: "CUSTOM_ERROR",
      details: null,
      message: "An error occurred",
      name: "ApiError",
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
    });
  });

  it("Sets all error metadata", () => {
    const err = new ApiError("An error occurred", {
      code: "CUSTOM_ERROR",
      status: HTTP_STATUS.BAD_REQUEST,
      details: { info: "Additional details" },
    });

    expect(err.toJSON()).toEqual({
      code: "CUSTOM_ERROR",
      details: { info: "Additional details" },
      message: "An error occurred",
      name: "ApiError",
      status: HTTP_STATUS.BAD_REQUEST,
      timestamp: expect.any(String),
    });
  });

  it("Captures stack trace", () => {
    const err = new ApiError("Error");
    expect(typeof err.stack).toBe("string");
    expect(err.stack).toContain("Error: Error");
    expect(err.name).toBe("ApiError");
  });
});
