import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "server/common/config/env.config";
import { AuthResult, AuthTokens, RefreshTokenPayload } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import { sendEmail } from "../../common/utils/email.util";
import { ApiError, NotFoundError } from "server/common/utils/error.util";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async sendMagicLink(email: string): Promise<void> {
    let user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      user = await this.authRepository.createUser({ email });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.authRepository.createMagicLink(token, user.id, email, expiresAt);

    await sendEmail(
      email,
      "Your Magic Link",
      `Click here to log in: ${env.CLIENT_URL}/auth/magic-link?token=${token}`
    );
  }

  async verifyMagicLink(token: string): Promise<AuthResult> {
    const magicLink = await this.authRepository.findMagicLink(token);

    if (!magicLink) {
      throw new ApiError("Invalid magic link", 400, "INVALID_MAGIC_LINK");
    }

    if (magicLink.usedAt) {
      throw new ApiError("Magic link already used", 400, "MAGIC_LINK_ALREADY_USED");
    }

    if (magicLink.expiresAt < new Date()) {
      throw new ApiError("Magic link expired", 400, "MAGIC_LINK_EXPIRED");
    }

    await this.authRepository.markMagicLinkAsUsed(token);

    const user = await this.authRepository.findUserByEmail(magicLink.email);

    if (!user) {
      throw new NotFoundError("User", magicLink.email);
    }

    const tokens = this.generateTokens(user.id, user.email);
    console.log(tokens.accessToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        avatar: user.githubAvatar,
        joinedAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async githubAuth(code: string): Promise<AuthResult> {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as { access_token: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      throw new ApiError("Failed to exchange GitHub code", 401, "GITHUB_AUTH_FAILED");
    }

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const profile = (await profileResponse.json()) as {
      id: number;
      login: string;
      avatar_url: string;
      email: string | null;
    };

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const emails = (await emailResponse.json()) as {
      email: string;
      primary: boolean;
      verified: boolean;
    }[];

    const primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? profile.email;

    if (!primaryEmail) {
      throw new ApiError("No verified email found on GitHub account", 400, "GITHUB_NO_EMAIL");
    }

    let user = await this.authRepository.findUserByGithubID(String(profile.id));

    if (!user) {
      user = await this.authRepository.findUserByEmail(primaryEmail);

      if (user) {
        user = await this.authRepository.updateUser(user.id, {
          githubId: String(profile.id),
          githubUsername: profile.login,
          githubAvatar: profile.avatar_url,
          githubAccessToken: tokenData.access_token,
        });
      } else {
        user = await this.authRepository.createUser({
          email: primaryEmail,
          githubId: String(profile.id),
          githubUsername: profile.login,
          githubAvatar: profile.avatar_url,
          githubAccessToken: tokenData.access_token,
        });
      }
    } else {
      user = await this.authRepository.updateUser(user.id, {
        githubAccessToken: tokenData.access_token,
        githubAvatar: profile.avatar_url,
      });
    }

    const tokens = this.generateTokens(user.id, user.email);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        avatar: user.githubAvatar,
        joinedAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    const existingToken = await this.authRepository.findRefreshToken(token);

    if (!existingToken) {
      throw new ApiError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    if (existingToken.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(token);
      throw new ApiError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
    }

    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch {
      await this.authRepository.deleteRefreshToken(token);
      throw new ApiError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    await this.authRepository.deleteRefreshToken(token);

    const user = await this.authRepository.findUserByEmail(decoded.userId);

    if (!user) {
      throw new NotFoundError("User", decoded.userId);
    }

    const tokens = this.generateTokens(user.id, user.email);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const existingToken = await this.authRepository.findRefreshToken(refreshToken);

    if (!existingToken || existingToken.userId !== userId) {
      throw new ApiError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: env.NODE_ENV === "development" ? "7d" : "15m",
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  }

  public generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }
}
