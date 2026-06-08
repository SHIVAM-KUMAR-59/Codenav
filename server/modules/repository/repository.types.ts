import { z } from "zod";
import { Analysis, Repository } from "../../prisma/generated/prisma";

export const AnalyzeRepositorySchema = z.object({
  url: z.string().url(),
});

export interface GithubRepoMetadata {
  owner: string;
  name: string;
  defaultBranch: string;
  latestCommitSha: string;
  description: string | null;
  stars: number;
  language: string | null;
}

export interface RepositoryWithLatestAnalysis extends Repository {
  analyses: Analysis[];
}

export type AnalyzeRepositoryInput = z.infer<typeof AnalyzeRepositorySchema>;
