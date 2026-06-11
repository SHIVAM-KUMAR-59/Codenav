import { NotFoundError } from "server/common/utils/error.util";
import { AnalysisRepository } from "./analysis.repository";

export class AnalysisService {
  constructor(public readonly analysisRepository: AnalysisRepository) {}

  async findById(id: string) {
    const analysis = await this.analysisRepository.findById(id);
    if (!analysis) {
      throw new NotFoundError("Analysis", id);
    }

    return analysis;
  }
}
