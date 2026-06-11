import { Router, type Router as ExpressRouter } from "express";
import { AnalysisRepository } from "./analysis.repository";
import prisma from "../../common/config/prismaClient.config";
import { AnalysisSSE } from "./analysis.sse";
import { authenticate } from "server/common/middleware/auth.middleware";
import { AnalysisService } from "./analysis.service";
import { AnalysisController } from "./analysis.controller";

const router: ExpressRouter = Router();
const analysisRepository = new AnalysisRepository(prisma);
const analysisSSE = new AnalysisSSE(analysisRepository);
const analysisService = new AnalysisService(analysisRepository);
const analysisController = new AnalysisController(analysisService);

router.get("/:id/status", analysisSSE.streamAnalysisStatus);
router.get("/:id", authenticate, analysisController.fetchOne);

export default router;
