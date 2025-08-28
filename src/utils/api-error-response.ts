/**
 * ApiErrorResponse class to standardize error responses in API calls.
 * @class ApiErrorResponse
 * @property {string} message - The error message to be returned.
 * @property {unknown} error - Additional error details, if any.
 *
 * @example
 *
 * const response = new ApiErrorResponse("An error occurred", { code: 500, details: "Internal Server Error" });
 * return res.status(500).json(response.toJSON());
 */
export class ApiErrorResponse {
  constructor(
    private message: string = "An error occurred",
    private error: unknown = null,
  ) {}

  toJSON(): APIResponse {
    return {
      success: false,
      message: this.message,
      data: null,
      error: this.error,
    };
  }
}
