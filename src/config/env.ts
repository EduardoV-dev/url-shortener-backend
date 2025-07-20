import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production";

interface EnvConfig {
  PORT: number;
  NODE_ENV: NodeEnv;
}

export const ENVS: Readonly<EnvConfig> = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: (process.env.NODE_ENV as NodeEnv) || "development",
};
