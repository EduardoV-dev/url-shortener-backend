export class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    Error.captureStackTrace(this, this.constructor);
  }
}
