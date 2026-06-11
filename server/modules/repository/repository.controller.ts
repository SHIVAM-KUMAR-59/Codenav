import { BodyController, Controller } from "server/common/utils/types.util";
import { RepositoryService } from "./repository.service";
import { AnalyzeRepositoryInput } from "./repository.types";

export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  analyzeRepository: BodyController<AnalyzeRepositoryInput> = async (req, res, next) => {
    try {
      const { url } = req.body;
      const result = await this.repositoryService.analyzeRepository(url);
      res.status(200).json({
        message: "Repository analyzed successfully",
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  fetchAll: Controller = async (req, res, next) => {
    try {
      const result = await this.repositoryService.fetchAll();
      res.status(200).json({
        message: "Repositories fetched successfully",
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
