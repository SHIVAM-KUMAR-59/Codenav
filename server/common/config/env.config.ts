import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "./logger.config";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3001"),
  DATABASE_URL: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().default("587"),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  CLIENT_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("Invalid environment variables:");
  logger.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
