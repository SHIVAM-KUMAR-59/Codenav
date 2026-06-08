import { Router, type Router as ExpressRouter } from "express";
import authRouter from "./auth/auth.route";
import repositoryRouter from "./repository/repository.routes";
import analysisRouter from "./analysis/analysis.route";

const router: ExpressRouter = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/repositories", repositoryRouter);
router.use("/api/v1/analyses", analysisRouter);
export default router;
