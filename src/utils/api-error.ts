import { HTTP_STATUS } from "@/constants/common";

interface ApiErrorMeta {
  code: string;
  details: unknown;
  status: number;
}

export const DEFAULT_ERROR_CODE = "API_ERROR";

export class ApiError extends Error {
  public details: unknown;
  public status: number;
  public code: string;
  public timestamp: Date;

  constructor(message: string, options?: Partial<ApiErrorMeta>) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code || DEFAULT_ERROR_CODE;
    this.status = options?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    this.details = options?.details || null;
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
