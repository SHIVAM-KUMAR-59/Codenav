import { Queue } from "bullmq";
import { env } from "./env.config";

export const analysisQueue = new Queue("analysis", {
  connection: {
    url: env.REDIS_URL,
  },
});
