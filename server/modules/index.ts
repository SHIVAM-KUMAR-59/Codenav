import { Router, type Router as ExpressRouter } from "express";
import authRouter from "./auth/auth.route";

const router: ExpressRouter = Router();

router.use("/api/v1/auth", authRouter);

export default router;
