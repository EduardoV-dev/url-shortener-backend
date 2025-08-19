import { HTTP_STATUS } from "@/constants/common";

const NAME = "ApiError";
const DEFAULT_CODE = "API_ERROR";

export class ApiError extends Error {
  public details: unknown = null;
  public status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  public timestamp: Date = new Date();
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = NAME;
    this.code = DEFAULT_CODE;

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
