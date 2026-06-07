import { AuthService } from "./auth.service";
import { BodyController, isAuthenticatedRequest } from "../../common/utils/types.util";
import { SendMagicLinkInput, VerifyMagicLinkInput } from "./auth.types";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  sendMagicLink: BodyController<SendMagicLinkInput> = async (req, res, next) => {
    try {
      const { email } = req.body;

      await this.authService.sendMagicLink(email);
      res.status(200).json({
        success: true,
        message: "Magic link sent",
      });
    } catch (error) {
      next(error);
    }
  };

  verifyMagicLink: BodyController<VerifyMagicLinkInput> = async (req, res, next) => {
    try {
      const { token } = req.body;

      const result = await this.authService.verifyMagicLink(token);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  githubCallback: BodyController<{ code: string }> = async (req, res, next) => {
    try {
      const { code } = req.body;

      const result = await this.authService.githubAuth(code);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken: BodyController<{ refreshToken: string }> = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await this.authService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  logout: BodyController<{ refreshToken: string }> = async (req, res, next) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const userId = req.user.userId;
      const { refreshToken } = req.body;

      await this.authService.logout(userId, refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
