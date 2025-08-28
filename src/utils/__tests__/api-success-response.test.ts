import { ApiSuccessResponse } from "../api-success-response";

describe("ApiSuccessResponse", () => {
  it("Returns default success response when no arguments are provided", () => {
    const response = new ApiSuccessResponse();
    expect(response.toJSON()).toEqual({
      success: true,
      message: "Request was successful!",
      data: null,
      error: null,
    });
  });

  it("Sets the message and data properties when provided", () => {
    const data = { id: 1, value: "test" };
    const response = new ApiSuccessResponse("Custom message", data);
    expect(response.toJSON()).toEqual({
      success: true,
      message: "Custom message",
      data,
      error: null,
    });
  });

  it("Allows null data property", () => {
    const response = new ApiSuccessResponse("Only message");
    expect(response.toJSON()).toEqual({
      success: true,
      message: "Only message",
      data: null,
      error: null,
    });
  });
});
