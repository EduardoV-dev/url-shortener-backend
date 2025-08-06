import { HTTP_STATUS } from "@/constants/common";

export const DEFAULT_ERROR_CODE = "API_ERROR";

export class ApiError extends Error {
  public details: unknown = null;
  public status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  public code: string = DEFAULT_ERROR_CODE;
  public timestamp: Date = new Date();

  constructor(message: string) {
    super(message);
    this.name = "ApiError";

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public setDetails(details: unknown): this {
    this.details = details;
    return this;
  }

  public setStatus(status: number): this {
    this.status = status;
    return this;
  }

  public setCode(code: string): this {
    this.code = code;
    return this;
  }

  public toJSON() {
    return {
      code: this.code,
      details: this.details,
      message: this.message,
      name: this.name,
      status: this.status,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
