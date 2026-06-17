/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RepositoryService } from "../../modules/repository/repository.service";
import { RepositoryRepository } from "../../modules/repository/repository.repository";
import { AnalysisRepository } from "../../modules/analysis/analysis.repository";
import { mockRepository, mockAnalysis } from "../helpers/factories";
import { ApiError } from "../../common/utils/error.util";
import { AnalysisStatus } from "../../prisma/generated/prisma/index.js";

vi.mock("../../common/config/queue.config", () => ({
  analysisQueue: {
    add: vi.fn().mockResolvedValue({ id: "job-1" }),
  },
}));

global.fetch = vi.fn();

const mockRepositoryRepository = {
  findByUrl: vi.fn(),
  findByOwnerAndName: vi.fn(),
  findWithLatestAnalysis: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
} as unknown as RepositoryRepository;

const mockAnalysisRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByRepositoryAndCommit: vi.fn(),
  findLatestByRepository: vi.fn(),
  updateStatus: vi.fn(),
  updateError: vi.fn(),
  saveResults: vi.fn(),
  createOrReset: vi.fn(),
} as unknown as AnalysisRepository;

describe("RepositoryService", () => {
  let repositoryService: RepositoryService;

  beforeEach(() => {
    repositoryService = new RepositoryService(mockRepositoryRepository, mockAnalysisRepository);
    vi.clearAllMocks();
  });

  describe("analyzeRepository", () => {
    it("throws on invalid GitHub URL", async () => {
      await expect(
        repositoryService.analyzeRepository("https://gitlab.com/owner/repo")
      ).rejects.toThrow(ApiError);
    });

    it("returns cached result if analysis exists and is completed", async () => {
      const repo = mockRepository();
      const analysis = mockAnalysis({ status: AnalysisStatus.COMPLETED });

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

      vi.mocked(mockRepositoryRepository.findByOwnerAndName).mockResolvedValue(repo);
      vi.mocked(mockRepositoryRepository.findWithLatestAnalysis).mockResolvedValue({
        ...repo,
        analyses: [analysis],
      });

      const result = await repositoryService.analyzeRepository(
        "https://github.com/expressjs/express"
      );

      expect(result.cached).toBe(true);
      expect(result.status).toBe(AnalysisStatus.COMPLETED);
    });

    it("creates new analysis for new repository", async () => {
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
          json: async () => ({ sha: "newsha123" }),
        } as any);

      vi.mocked(mockRepositoryRepository.findByOwnerAndName).mockResolvedValue(null);
      vi.mocked(mockRepositoryRepository.create).mockResolvedValue(mockRepository());
      vi.mocked(mockAnalysisRepository.createOrReset).mockResolvedValue(
        mockAnalysis({ status: AnalysisStatus.PENDING })
      );

      const result = await repositoryService.analyzeRepository(
        "https://github.com/expressjs/express"
      );

      expect(result.cached).toBe(false);
      expect(mockRepositoryRepository.create).toHaveBeenCalled();
      expect(mockAnalysisRepository.createOrReset).toHaveBeenCalled();
    });

    it("throws if GitHub API returns 404", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

      await expect(
        repositoryService.analyzeRepository("https://github.com/nonexistent/repo")
      ).rejects.toThrow(ApiError);
    });
  });
});
