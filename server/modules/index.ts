import { Router, type Router as ExpressRouter } from "express";
import authRouter from "./auth/auth.route";
import repositoryRouter from "./repository/repository.routes";

const router: ExpressRouter = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/repositories", repositoryRouter);
export default router;
