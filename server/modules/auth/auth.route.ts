import { Router, type Router as ExpressRouter } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { authenticate } from "../../common/middleware/auth.middleware";
import { validateBody } from "../../common/middleware/validate.middleware";
import { SendMagicLinkSchema, VerifyMagicLinkSchema, RefreshTokenSchema } from "./auth.types";
import prisma from "../../common/config/prismaClient.config";

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router: ExpressRouter = Router();

router.post("/magic-link/send", validateBody(SendMagicLinkSchema), authController.sendMagicLink);

router.post(
  "/magic-link/verify",
  validateBody(VerifyMagicLinkSchema),
  authController.verifyMagicLink
);

router.get("/github", authController.githubRedirect);
router.get("/github/callback", authController.githubCallback);

router.post("/refresh", validateBody(RefreshTokenSchema), authController.refreshToken);

router.post("/logout", authenticate, validateBody(RefreshTokenSchema), authController.logout);

export default router;
