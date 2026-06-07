import { Redis } from "ioredis";
import { env } from "./env.config";
import { logger } from "./logger.config";

const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  logger.success("Redis connected successfully");
});

redis.on("error", (err) => {
  logger.error("Redis error:", err);
});

export default redis;
