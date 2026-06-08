import { Request, Response } from "express";
import { AnalysisRepository } from "./analysis.repository";
import { logger } from "../../common/config/logger.config";
import { ApiError } from "../../common/utils/error.util";
import { Redis } from "ioredis";

export class AnalysisSSE {
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  streamAnalysisStatus = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const analysis = await this.analysisRepository.findById(id);

    if (!analysis) {
      throw new ApiError("Analysis not found", 404, "ANALYSIS_NOT_FOUND");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({
      status: analysis.status,
      progress: analysis.progress,
      message: analysis.message,
    });

    if (analysis.status === "COMPLETED" || analysis.status === "FAILED") {
      res.end();
      return;
    }

    const subscriber = new Redis(process.env.REDIS_URL!);
    const channel = `analysis:${id}`;

    await subscriber.subscribe(channel);

    subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          const event = JSON.parse(message);
          sendEvent(event);

          if (event.status === "COMPLETED" || event.status === "FAILED") {
            subscriber.unsubscribe(channel);
            subscriber.quit();
            res.end();
          }
        } catch {
          logger.error(`Failed to parse SSE message: ${message}`);
        }
      }
    });

    req.on("close", () => {
      logger.debug(`SSE client disconnected for analysis ${id}`);
      subscriber.unsubscribe(channel);
      subscriber.quit();
    });
  };
}
