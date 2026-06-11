import { ParamsController } from "server/common/utils/types.util";
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
}
