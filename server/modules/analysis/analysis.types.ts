import { Analysis, Repository } from "server/prisma/generated/prisma";
import { z } from "zod";

export const QueryAnalysisSchema = z.object({
  question: z.string().min(5).max(500),
});

export type QueryAnalysisInput = z.infer<typeof QueryAnalysisSchema>;

export type QueryType = "flow" | "file" | "impact";

export interface QueryResponse {
  explanation: string;
  files: { path: string; role: string }[];
  readingOrder: string[];
  queryType: QueryType;
}

export type AnalysisWithRepository = Analysis & {
  repository: Repository;
};
