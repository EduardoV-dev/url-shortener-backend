import dotenv from "dotenv";

dotenv.config();

export const ENVS = Object.freeze({
  CORS_ORIGINS: process.env.CORS_ORIGINS || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  SWAGGER_SERVER_V1: process.env.SWAGGER_SERVER_V1 || "",
});
