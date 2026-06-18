/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import { buildApp } from "../helpers/app";
import { mockAnalysis, mockRepository } from "../helpers/factories";
import prisma from "../../common/config/prismaClient.config";
vi.mock("../../common/config/prismaClient.config", () => ({
  default: {
    repository: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },

    analysis: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },

    userRepository: {
      upsert: vi.fn(),
    },
  },
}));
vi.mock("../../common/config/queue.config", () => ({
  analysisQueue: {
    add: vi.fn().mockResolvedValue({ id: "job-1" }),
  },
}));

global.fetch = vi.fn();

const getValidToken = () =>
  jwt.sign(
    { userId: "user-1", email: "test@example.com" },
    process.env.JWT_ACCESS_TOKEN_SECRET ?? "test-secret"
  );

describe("Repository API", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/repositories/analyze", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app)
        .post("/api/v1/repositories/analyze")
        .send({ url: "https://github.com/expressjs/express" });

      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid URL", async () => {
      const res = await request(app)
        .post("/api/v1/repositories/analyze")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ url: "not-a-url" });

      expect(res.status).toBe(400);
    });

    it("returns 400 for non-GitHub URL", async () => {
      const res = await request(app)
        .post("/api/v1/repositories/analyze")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ url: "https://gitlab.com/owner/repo" });

      expect(res.status).toBe(400);
    });

    it("returns 200 for valid GitHub URL", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: "express",
            owner: { login: "expressjs" },
            default_branch: "master",
            description: null,
            stargazers_count: 100,
            language: "JavaScript",
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sha: "abc1234" }),
        } as any);

      vi.mocked(prisma.repository.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.repository.create).mockResolvedValue(mockRepository() as any);
      vi.mocked(prisma.analysis.upsert).mockResolvedValue(mockAnalysis() as any);
      vi.mocked(prisma.userRepository.upsert).mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/v1/repositories/analyze")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ url: "https://github.com/expressjs/express" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analysisId).toBeDefined();
    });
  });
});
