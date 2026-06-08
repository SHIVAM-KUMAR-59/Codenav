import { Worker } from "bullmq";
import { env } from "../common/config/env.config";
import { logger } from "../common/config/logger.config";
import { ProgressPublisher } from "./progressPublisher.worker";
import { AnalysisRepository } from "server/modules/analysis/analysis.repository";
import prisma from "server/common/config/prismaClient.config";
import { AnalysisStatus } from "server/prisma/generated/prisma";

const analysisRepository = new AnalysisRepository(prisma);
const progressPublisher = new ProgressPublisher(analysisRepository);

export const analysisWorker = new Worker(
  "analysis",
  async (job) => {
    const { repositoryId, analysisId } = job.data;
    logger.debug(`Processing analysis ${analysisId} for repository ${repositoryId}`);

    await progressPublisher.publish(analysisId, {
      status: AnalysisStatus.CLONING,
      progress: 10,
      message: "Cloning repository...",
    });

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
