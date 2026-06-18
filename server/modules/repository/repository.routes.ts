import { Router, type Router as ExpressRouter } from "express";
import prisma from "../../common/config/prismaClient.config";
import { RepositoryRepository } from "./repository.repository";
import { RepositoryService } from "./repository.service";
import { AnalysisRepository } from "../analysis/analysis.repository";
import { RepositoryController } from "./repository.controller";
import { authenticate } from "server/common/middleware/auth.middleware";

const repositoryRepository = new RepositoryRepository(prisma);
const analysisRepository = new AnalysisRepository(prisma);
const repositoryService = new RepositoryService(repositoryRepository, analysisRepository);
const repositoryController = new RepositoryController(repositoryService);

const router: ExpressRouter = Router();

router.post("/analyze", authenticate, repositoryController.analyzeRepository);
router.get("/", authenticate, repositoryController.fetchAll);

export default router;
