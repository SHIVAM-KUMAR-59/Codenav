import { BodyController, Controller, isAuthenticatedRequest } from "../../common/utils/types.util";
import { RepositoryService } from "./repository.service";
import { AnalyzeRepositoryInput } from "./repository.types";

export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  analyzeRepository: BodyController<AnalyzeRepositoryInput> = async (req, res, next) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        throw new Error("Unauthorized");
      }

      const { url } = req.body;
      const userId = req.user.userId;

      const result = await this.repositoryService.analyzeRepository(url, userId);

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
      if (!isAuthenticatedRequest(req)) {
        throw new Error("Unauthorized");
      }

      const userId = req.user.userId;
      const result = await this.repositoryService.fetchAll(userId);

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
