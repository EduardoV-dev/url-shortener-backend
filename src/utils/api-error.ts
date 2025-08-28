import { HTTP_STATUS } from "@/constants/common";

export const API_ERROR = Object.freeze({
  NAME: "ApiError",
  DEFAULT_CODE: "API_ERROR",
});

export type ApiErrorOptions = Partial<{
  code: string;
  details: unknown;
  status: number;
}>;

export class ApiError extends Error {
  public details: unknown;
  public status: number;
  public timestamp: Date;
  public code: string;

  constructor(message: string, options?: ApiErrorOptions) {
    super(message);
    this.code = options?.code || API_ERROR.DEFAULT_CODE;
    this.details = options?.details || null;
    this.name = API_ERROR.NAME;
    this.status = options?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
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
