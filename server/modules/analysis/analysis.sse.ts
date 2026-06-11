import { Request, Response } from "express";
import { AnalysisRepository } from "./analysis.repository";
import { logger } from "../../common/config/logger.config";
import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { env } from "../../common/config/env.config";

export class AnalysisSSE {
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  streamAnalysisStatus = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const token = req.query.token as string | undefined;

    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized", errorCode: "UNAUTHORIZED" });
      return;
    }

    try {
      jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET);
    } catch {
      res.status(401).json({ success: false, message: "Unauthorized", errorCode: "UNAUTHORIZED" });
      return;
    }

    const analysis = await this.analysisRepository.findById(id);

    if (!analysis) {
      res
        .status(404)
        .json({ success: false, message: "Analysis not found", errorCode: "ANALYSIS_NOT_FOUND" });
      return;
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
