/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { buildApp } from "../helpers/app";
import { mockMagicLink, mockUser } from "../helpers/factories";
import prisma from "../../common/config/prismaClient.config";

vi.mock("../../common/config/prismaClient.config", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    magicLink: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../../common/utils/email.util", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Auth API", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/magic-link/send", () => {
    it("returns 200 for valid email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser() as any);
      vi.mocked(prisma.magicLink.create).mockResolvedValue(mockMagicLink() as any);

      const res = await request(app)
        .post("/api/v1/auth/magic-link/send")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/magic-link/send")
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for missing email", async () => {
      const res = await request(app).post("/api/v1/auth/magic-link/send").send({});

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/magic-link/verify", () => {
    it("returns 400 for invalid token", async () => {
      vi.mocked(prisma.magicLink.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/magic-link/verify")
        .send({ token: "invalid-token" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for used token", async () => {
      vi.mocked(prisma.magicLink.findUnique).mockResolvedValue(
        mockMagicLink({ usedAt: new Date() }) as any
      );

      const res = await request(app)
        .post("/api/v1/auth/magic-link/verify")
        .send({ token: "used-token" });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("MAGIC_LINK_ALREADY_USED");
    });

    it("returns 400 for expired token", async () => {
      vi.mocked(prisma.magicLink.findUnique).mockResolvedValue(
        mockMagicLink({ expiresAt: new Date(Date.now() - 1000) }) as any
      );

      const res = await request(app)
        .post("/api/v1/auth/magic-link/verify")
        .send({ token: "expired-token" });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("MAGIC_LINK_EXPIRED");
    });

    it("returns 200 with tokens for valid token", async () => {
      const user = mockUser();

      vi.mocked(prisma.magicLink.findUnique).mockResolvedValue(
        mockMagicLink({
          userId: user.id,
          user,
        }) as any
      );

      vi.mocked(prisma.magicLink.update).mockResolvedValue(
        mockMagicLink({
          userId: user.id,
          user,
          usedAt: new Date(),
        }) as any
      );

      vi.mocked(prisma.magicLink.updateMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);
      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/v1/auth/magic-link/verify")
        .send({ token: "valid-token-123" });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("returns 401 if no refresh token cookie", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(401);
    });
  });
});
