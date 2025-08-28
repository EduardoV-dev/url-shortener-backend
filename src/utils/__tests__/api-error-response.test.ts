import { ApiErrorResponse } from "../api-error-response";

describe("ApiErrorResponse", () => {
  it("Returns default error response when no arguments are provided", () => {
    const response = new ApiErrorResponse();
    expect(response.toJSON()).toEqual({
      success: false,
      message: "An error occurred",
      data: null,
      error: null,
    });
  });

  it("Sets the message and error properties when provided", () => {
    const err = { code: 400, details: "Bad Request" };
    const response = new ApiErrorResponse("Custom error", err);
    expect(response.toJSON()).toEqual({
      success: false,
      message: "Custom error",
      data: null,
      error: err,
    });
  });

  it("Allows null error property", () => {
    const response = new ApiErrorResponse("Only message");
    expect(response.toJSON()).toEqual({
      success: false,
      message: "Only message",
      data: null,
      error: null,
    });
  });
});
