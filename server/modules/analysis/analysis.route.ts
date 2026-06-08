import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "server/common/middleware/auth.middleware";
import { AnalysisRepository } from "./analysis.repository";
import prisma from "../../common/config/prismaClient.config";
import { AnalysisSSE } from "./analysis.sse";

const router: ExpressRouter = Router();
const analysisRepository = new AnalysisRepository(prisma);
const analysisSSE = new AnalysisSSE(analysisRepository);

router.get("/:id/status", authenticate, analysisSSE.streamAnalysisStatus);

export default router;
