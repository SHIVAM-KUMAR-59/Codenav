import { AnalysisStatus } from "../../prisma/generated/prisma";
import { RepositoryRepository } from "./repository.repository";
import { GithubRepoMetadata } from "./repository.types";
import { ApiError } from "../../common/utils/error.util";
import { AnalysisRepository } from "../analysis/analysis.repository";
import { analysisQueue } from "../../common/config/queue.config";
import { logger } from "../../common/config/logger.config";

export class RepositoryService {
  constructor(
    private readonly repositoryRepository: RepositoryRepository,
    private readonly analysisRepository: AnalysisRepository
  ) {}

  private parseGithubUrl(url: string): { owner: string; name: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match || !match[1] || !match[2]) {
      throw new ApiError("Invalid GitHub URL", 400, "INVALID_GITHUB_URL");
    }
    return {
      owner: match[1],
      name: match[2].replace(/\.git$/, ""),
    };
  }

  private async fetchGithubMetadata(owner: string, name: string): Promise<GithubRepoMetadata> {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new ApiError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }
      throw new ApiError("Failed to fetch repository metadata", 500, "GITHUB_API_ERROR");
    }

    const repoData = (await repoResponse.json()) as {
      name: string;
      owner: { login: string };
      default_branch: string;
      description: string | null;
      stargazers_count: number;
      language: string | null;
    };

    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits/${repoData.default_branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!commitResponse.ok) {
      throw new ApiError("Failed to fetch latest commit", 500, "GITHUB_API_ERROR");
    }

    const commitData = (await commitResponse.json()) as { sha: string };

    return {
      owner,
      name: repoData.name,
      defaultBranch: repoData.default_branch,
      latestCommitSha: commitData.sha,
      description: repoData.description,
      stars: repoData.stargazers_count,
      language: repoData.language,
    };
  }

  async analyzeRepository(
    url: string,
    userId: string
  ): Promise<{ analysisId: string; status: AnalysisStatus; cached: boolean }> {
    const { owner, name } = this.parseGithubUrl(url);
    const metadata = await this.fetchGithubMetadata(owner, name);
    let repository = await this.repositoryRepository.findByOwnerAndName(owner, name);

    if (repository) {
      const id = repository.id;
      await this.repositoryRepository.linkUserToRepository(userId, id);
      const existing = await this.repositoryRepository.findWithLatestAnalysis(url);
      const latestAnalysis = existing?.analyses[0];

      if (latestAnalysis && latestAnalysis.commitSha === metadata.latestCommitSha) {
        if (latestAnalysis.status === AnalysisStatus.COMPLETED) {
          return {
            analysisId: latestAnalysis.id,
            status: AnalysisStatus.COMPLETED,
            cached: true,
          };
        }

        if (latestAnalysis.status !== AnalysisStatus.FAILED) {
          return {
            analysisId: latestAnalysis.id,
            status: latestAnalysis.status,
            cached: false,
          };
        }
      }

      await this.repositoryRepository.update(repository.id, {
        latestCommitSha: metadata.latestCommitSha,
      });
    } else {
      repository = await this.repositoryRepository.create({
        url,
        owner: metadata.owner,
        name: metadata.name,
        defaultBranch: metadata.defaultBranch,
        latestCommitSha: metadata.latestCommitSha,
      });
      const id = repository.id;
      await this.repositoryRepository.linkUserToRepository(userId, id);
    }

    const analysis = await this.analysisRepository.createOrReset(
      repository.id,
      metadata.latestCommitSha
    );

    await analysisQueue.add("analyze-repository", {
      repositoryId: repository.id,
      analysisId: analysis.id,
    });

    logger.debug(`Job queued for analysis ${analysis.id}`);

    return {
      analysisId: analysis.id,
      status: AnalysisStatus.PENDING,
      cached: false,
    };
  }

  async fetchAll(id: string) {
    return await this.repositoryRepository.findAllWithLatestAnalysis(id);
  }
}
