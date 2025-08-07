import { HTTP_STATUS } from "@/constants/common";

export class ApiError extends Error {
  public details: unknown = null;
  public status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
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

  public toJSON() {
    return {
      details: this.details,
      message: this.message,
      name: this.name,
      status: this.status,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
