/**
 * ApiSuccessResponse class to standard the success responses in the API.
 *
 * @class ApiSuccessResponse
 * @property {string} message - The success message.
 * @property {unknown} data - The data returned in the response.
 *
 * @example
 * const response = new ApiSuccessResponse("Data fetched successfully", { id: 1, name: "John Doe" });
 * return res.status(200).json(response.toJSON());
 */
export class ApiSuccessResponse {
  constructor(
    private message: string = "Request was successful!",
    private data: unknown = null,
  ) {}

  toJSON(): APIResponse {
    return {
      success: true,
      message: this.message,
      data: this.data,
      error: null,
    };
  }
}
