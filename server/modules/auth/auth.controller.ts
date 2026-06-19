import { AuthService } from "./auth.service";
import {
  BodyController,
  Controller,
  isAuthenticatedRequest,
  QueryController,
} from "../../common/utils/types.util";
import { SendMagicLinkInput, VerifyMagicLinkInput } from "./auth.types";
import { env } from "../../common/config/env.config";

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

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
        message: "Authentication successful",
      });
    } catch (error) {
      next(error);
    }
  };

  githubRedirect: Controller = async (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${env.GITHUB_CALLBACK_URL}&scope=user:email`;
    res.redirect(githubAuthUrl);
  };

  githubCallback: QueryController<{ code: string }> = async (req, res, next) => {
    try {
      const { code } = req.query;
      const result = await this.authService.githubAuth(code);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${env.CLIENT_URL}/auth/callback?accessToken=${result.tokens.accessToken}`);
    } catch (error) {
      next(error);
    }
  };

  refreshToken: Controller = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      const tokens = await this.authService.refreshToken(refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
        message: "Token refreshed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  logout: Controller = async (req, res, next) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const userId = req.user.userId;
      const refreshToken = req.cookies.refreshToken;
      await this.authService.logout(userId, refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  me: Controller = async (req, res, next) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const userId = req.user.userId;

      const result = await this.authService.me(userId);

      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
