import dotenv from "dotenv";
import path from "path";

const SUPPORTED_ENV_FILES = [".env", ".env.local"];

dotenv.config({
  path: SUPPORTED_ENV_FILES.map((file) => path.resolve(process.cwd(), file)),
});

export const ENVS = Object.freeze({
  CORS_ORIGINS: process.env.CORS_ORIGINS || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
});
