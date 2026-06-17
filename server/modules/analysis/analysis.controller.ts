import { BodyParamsController, ParamsController } from "server/common/utils/types.util";
import { AnalysisService } from "./analysis.service";

export class AnalysisController {
  constructor(public readonly analysisService: AnalysisService) {}

  fetchOne: ParamsController<{ id: string }> = async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await this.analysisService.findById(id);
      res.status(200).json({
        message: "Analysis fetched successfully",
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  queryAnalysis: BodyParamsController<{ question: string }, { id: string }> = async (
    req,
    res,
    next
  ) => {
    try {
      const { id } = req.params;
      const { question } = req.body;
      const result = await this.analysisService.queryAnalysis(id, question);
      res.status(200).json({
        success: true,
        message: "Query completed",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
