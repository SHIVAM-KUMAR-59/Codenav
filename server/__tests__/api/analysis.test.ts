/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import { buildApp } from "../helpers/app";
import { mockAnalysisWithRepository } from "../helpers/factories";
import { AnalysisStatus } from "../../prisma/generated/prisma/index.js";
import prisma from "../../common/config/prismaClient.config";

vi.mock("../../common/config/prismaClient.config", () => ({
  default: {
    analysis: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../common/config/groq.config", () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  explanation: "Mock AI explanation",
                  queryType: "GENERAL",
                }),
              },
            },
          ],
        }),
      },
    },
  },
}));

const getValidToken = () =>
  jwt.sign(
    { userId: "user-1", email: "test@example.com" },
    process.env.JWT_ACCESS_TOKEN_SECRET ?? "test-secret"
  );

describe("Analysis API", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/analyses/:id", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get("/api/v1/analyses/analysis-1");

      expect(res.status).toBe(401);
    });

    it("returns 404 for nonexistent analysis", async () => {
      vi.mocked(prisma.analysis.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/analyses/nonexistent")
        .set("Authorization", `Bearer ${getValidToken()}`);

      expect(res.status).toBe(404);
    });

    it("returns 200 with analysis data", async () => {
      vi.mocked(prisma.analysis.findUnique).mockResolvedValue(mockAnalysisWithRepository() as any);

      const res = await request(app)
        .get("/api/v1/analyses/analysis-1")
        .set("Authorization", `Bearer ${getValidToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe("POST /api/v1/analyses/:id/query", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app)
        .post("/api/v1/analyses/analysis-1/query")
        .send({ question: "How does auth work?" });

      expect(res.status).toBe(401);
    });

    it("returns 400 for missing question", async () => {
      const res = await request(app)
        .post("/api/v1/analyses/analysis-1/query")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 400 for question that is too short", async () => {
      const res = await request(app)
        .post("/api/v1/analyses/analysis-1/query")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ question: "hi" });

      expect(res.status).toBe(400);
    });

    it("returns 404 for nonexistent analysis", async () => {
      vi.mocked(prisma.analysis.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/analyses/nonexistent/query")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ question: "How does authentication work?" });

      expect(res.status).toBe(404);
    });

    it("returns 400 if analysis is not completed", async () => {
      vi.mocked(prisma.analysis.findUnique).mockResolvedValue(
        mockAnalysisWithRepository({
          status: AnalysisStatus.PENDING,
        }) as any
      );

      const res = await request(app)
        .post("/api/v1/analyses/analysis-1/query")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ question: "How does authentication work?" });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("ANALYSIS_NOT_COMPLETED");
    });

    it("returns 200 with AI response for completed analysis", async () => {
      vi.mocked(prisma.analysis.findUnique).mockResolvedValue(
        mockAnalysisWithRepository({
          status: AnalysisStatus.COMPLETED,
        }) as any
      );

      const res = await request(app)
        .post("/api/v1/analyses/analysis-1/query")
        .set("Authorization", `Bearer ${getValidToken()}`)
        .send({ question: "How does authentication work?" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.explanation).toBeDefined();
      expect(res.body.data.queryType).toBeDefined();
    });
  });
});
