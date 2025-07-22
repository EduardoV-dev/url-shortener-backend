import dotenv from "dotenv";

dotenv.config();

export const ENVS = Object.freeze({
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  SWAGGER_SERVER_V1: process.env.SWAGGER_SERVER_V1 || "",
});
