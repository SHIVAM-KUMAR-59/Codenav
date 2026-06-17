import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalysisService } from "../../modules/analysis/analysis.service";
import { AnalysisRepository } from "../../modules/analysis/analysis.repository";
import { mockAnalysisWithRepository } from "../helpers/factories";
import { NotFoundError, ApiError } from "../../common/utils/error.util";
import { AnalysisStatus } from "../../prisma/generated/prisma/index.js";

const mockAnalysisRepository = {
  findById: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
  updateError: vi.fn(),
  saveResults: vi.fn(),
  createOrReset: vi.fn(),
} as unknown as AnalysisRepository;

describe("AnalysisService", () => {
  let analysisService: AnalysisService;

  beforeEach(() => {
    analysisService = new AnalysisService(mockAnalysisRepository);
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("returns analysis if found", async () => {
      const analysis = mockAnalysisWithRepository();
      vi.mocked(mockAnalysisRepository.findById).mockResolvedValue(analysis);

      const result = await analysisService.findById("analysis-1");
      expect(result.id).toBe("analysis-1");
    });

    it("throws NotFoundError if not found", async () => {
      vi.mocked(mockAnalysisRepository.findById).mockResolvedValue(null);
      await expect(analysisService.findById("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("queryAnalysis", () => {
    it("throws if analysis not found", async () => {
      vi.mocked(mockAnalysisRepository.findById).mockResolvedValue(null);
      await expect(
        analysisService.queryAnalysis("nonexistent", "how does auth work")
      ).rejects.toThrow(NotFoundError);
    });

    it("throws if analysis not completed", async () => {
      vi.mocked(mockAnalysisRepository.findById).mockResolvedValue(
        mockAnalysisWithRepository({ status: AnalysisStatus.PENDING })
      );
      await expect(
        analysisService.queryAnalysis("analysis-1", "how does auth work")
      ).rejects.toThrow(ApiError);
    });

    it("returns AI response for completed analysis", async () => {
      vi.mocked(mockAnalysisRepository.findById).mockResolvedValue(
        mockAnalysisWithRepository({ status: AnalysisStatus.COMPLETED })
      );

      const result = await analysisService.queryAnalysis("analysis-1", "how does auth work");
      expect(result.explanation).toBeDefined();
      expect(result.queryType).toBeDefined();
    });
  });
});
