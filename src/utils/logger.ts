import { createLogger, format, transports } from "winston";

const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || "info";
const TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";

const LOG_FILES = {
  APP: "logs/app.log",
  ERROR: "logs/error.log",
  EXCEPTION: "logs/exception.log",
  REJECTION: "logs/rejection.log",
};

export const logger = createLogger({
  level: DEFAULT_LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: TIMESTAMP_FORMAT }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        }),
      ),
    }),
    new transports.File({ filename: LOG_FILES.APP }),
    new transports.File({ filename: LOG_FILES.ERROR, level: "error" }),
  ],
  exceptionHandlers: [new transports.File({ filename: LOG_FILES.EXCEPTION })],
  rejectionHandlers: [new transports.File({ filename: LOG_FILES.REJECTION })],
});
