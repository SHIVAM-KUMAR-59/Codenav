import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../modules/auth/auth.service";
import { AuthRepository } from "../../modules/auth/auth.repository";
import { mockUser, mockMagicLink, mockRefreshToken } from "../helpers/factories";
import { ApiError } from "../../common/utils/error.util";

vi.mock("../../common/utils/email.util", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

const mockAuthRepository = {
  findUserByEmail: vi.fn(),
  findUserByGithubID: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  createMagicLink: vi.fn(),
  findMagicLink: vi.fn(),
  markMagicLinkAsUsed: vi.fn(),
  deleteMagicLink: vi.fn(),
  saveRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  deleteAllRefreshTokensForUser: vi.fn(),
} as unknown as AuthRepository;

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockAuthRepository);
    vi.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("returns access and refresh tokens", () => {
      const tokens = authService.generateTokens("user-1", "test@example.com");
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });

    it("returns valid access and refresh tokens", () => {
      const tokens = authService.generateTokens("user-1", "test@example.com");

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });
  });

  describe("sendMagicLink", () => {
    it("creates user if not exists and sends magic link", async () => {
      vi.mocked(mockAuthRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(mockAuthRepository.createUser).mockResolvedValue(mockUser());
      vi.mocked(mockAuthRepository.createMagicLink).mockResolvedValue(undefined);

      await authService.sendMagicLink("test@example.com");

      expect(mockAuthRepository.createUser).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockAuthRepository.createMagicLink).toHaveBeenCalled();
    });

    it("uses existing user if found", async () => {
      vi.mocked(mockAuthRepository.findUserByEmail).mockResolvedValue(mockUser());
      vi.mocked(mockAuthRepository.createMagicLink).mockResolvedValue(undefined);

      await authService.sendMagicLink("test@example.com");

      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
      expect(mockAuthRepository.createMagicLink).toHaveBeenCalled();
    });
  });

  describe("verifyMagicLink", () => {
    it("throws if token not found", async () => {
      vi.mocked(mockAuthRepository.findMagicLink).mockResolvedValue(null);
      await expect(authService.verifyMagicLink("invalid-token")).rejects.toThrow(ApiError);
    });

    it("throws if token already used", async () => {
      vi.mocked(mockAuthRepository.findMagicLink).mockResolvedValue(
        mockMagicLink({ usedAt: new Date() })
      );
      await expect(authService.verifyMagicLink("used-token")).rejects.toThrow(ApiError);
    });

    it("throws if token expired", async () => {
      vi.mocked(mockAuthRepository.findMagicLink).mockResolvedValue(
        mockMagicLink({ expiresAt: new Date(Date.now() - 1000) })
      );
      await expect(authService.verifyMagicLink("expired-token")).rejects.toThrow(ApiError);
    });

    it("returns auth result for valid token", async () => {
      vi.mocked(mockAuthRepository.findMagicLink).mockResolvedValue(mockMagicLink());
      vi.mocked(mockAuthRepository.markMagicLinkAsUsed).mockResolvedValue(true);
      vi.mocked(mockAuthRepository.findUserByEmail).mockResolvedValue(mockUser());
      vi.mocked(mockAuthRepository.saveRefreshToken).mockResolvedValue(undefined);

      const result = await authService.verifyMagicLink("valid-token-123");

      expect(result.user.email).toBe("test@example.com");
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });
  });

  describe("refreshToken", () => {
    it("throws if refresh token not found", async () => {
      vi.mocked(mockAuthRepository.findRefreshToken).mockResolvedValue(null);
      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(ApiError);
    });

    it("throws and deletes if refresh token expired", async () => {
      vi.mocked(mockAuthRepository.findRefreshToken).mockResolvedValue(
        mockRefreshToken({ expiresAt: new Date(Date.now() - 1000) })
      );
      vi.mocked(mockAuthRepository.deleteRefreshToken).mockResolvedValue(undefined);

      await expect(authService.refreshToken("expired-token")).rejects.toThrow(ApiError);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("deletes refresh token on logout", async () => {
      vi.mocked(mockAuthRepository.findRefreshToken).mockResolvedValue(mockRefreshToken());
      vi.mocked(mockAuthRepository.deleteRefreshToken).mockResolvedValue(undefined);

      await authService.logout("user-1", "refresh-token-123");

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith("refresh-token-123");
    });

    it("throws if token belongs to different user", async () => {
      vi.mocked(mockAuthRepository.findRefreshToken).mockResolvedValue(
        mockRefreshToken({ userId: "different-user" })
      );

      await expect(authService.logout("user-1", "refresh-token-123")).rejects.toThrow(ApiError);
    });
  });
});
