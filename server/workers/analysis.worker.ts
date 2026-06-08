import { Worker } from "bullmq";
import { env } from "../common/config/env.config";
import { logger } from "../common/config/logger.config";
import { ProgressPublisher } from "./progressPublisher.worker";
import { AnalysisRepository } from "server/modules/analysis/analysis.repository";
import prisma from "server/common/config/prismaClient.config";
import { AnalysisStatus, Prisma } from "server/prisma/generated/prisma";
import { analyzeRepository } from "@codenav/processor";
import { RepositoryRepository } from "server/modules/repository/repository.repository";

const analysisRepository = new AnalysisRepository(prisma);
const progressPublisher = new ProgressPublisher(analysisRepository);
const repositoryRepository = new RepositoryRepository(prisma);

export const analysisWorker = new Worker(
  "analysis",
  async (job) => {
    const { repositoryId, analysisId } = job.data;
    logger.debug(`Processing analysis ${analysisId} for repository ${repositoryId}`);

    // fetch repository details for owner/name
    const repository = await repositoryRepository.findById(repositoryId);
    if (!repository) throw new Error(`Repository ${repositoryId} not found`);

    await progressPublisher.publish(analysisId, {
      status: AnalysisStatus.CLONING,
      progress: 10,
      message: "Cloning repository...",
    });

    const result = await analyzeRepository({
      repositoryId,
      analysisId,
      owner: repository.owner,
      name: repository.name,
      defaultBranch: repository.defaultBranch,
      clonePath: `/tmp/codenav/${analysisId}`,
    });

    await progressPublisher.publish(analysisId, {
      status: AnalysisStatus.SAVING_RESULTS,
      progress: 90,
      message: "Saving results...",
    });

    await analysisRepository.saveResults(analysisId, {
      graph: result.graph as unknown as Prisma.InputJsonValue,
      modules: result.modules as unknown as Prisma.InputJsonValue,
      entryPoints: result.entryPoints as unknown as Prisma.InputJsonValue,
      learningPaths: result.learningPaths as unknown as Prisma.InputJsonValue,
      languageStats: result.languageStats as unknown as Prisma.InputJsonValue,
    });

    await progressPublisher.publish(analysisId, {
      status: AnalysisStatus.COMPLETED,
      progress: 100,
      message: "Analysis complete",
    });
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
