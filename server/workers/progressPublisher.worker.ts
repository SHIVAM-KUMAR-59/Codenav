import { AnalysisStatus } from "../prisma/generated/prisma";
import { AnalysisRepository } from "../modules/analysis/analysis.repository";
import redis from "../common/config/redis.config";
import { logger } from "../common/config/logger.config";

interface ProgressEvent {
  status: AnalysisStatus;
  progress: number;
  message: string;
}

export class ProgressPublisher {
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async publish(analysisId: string, event: ProgressEvent): Promise<void> {
    await this.analysisRepository.updateStatus(
      analysisId,
      event.status,
      event.progress,
      event.message
    );

    await redis.publish(`analysis:${analysisId}`, JSON.stringify(event));

    logger.debug(
      `Progress published for analysis ${analysisId}: ${event.status} (${event.progress}%)`
    );
  }
}
