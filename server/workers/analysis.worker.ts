import { Worker } from "bullmq";
import { env } from "../common/config/env.config";
import { logger } from "../common/config/logger.config";

export const analysisWorker = new Worker(
  "analysis",
  async (job) => {
    const { repositoryId, analysisId } = job.data;
    logger.debug(`Processing analysis ${analysisId} for repository ${repositoryId}`);

    // TODO: processor calls will go here
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  }
);

analysisWorker.on("completed", (job) => {
  logger.debug(`Analysis job ${job.id} completed`);
});

analysisWorker.on("failed", (job, error) => {
  logger.error(`Analysis job ${job?.id} failed: ${error.message}`);
});
