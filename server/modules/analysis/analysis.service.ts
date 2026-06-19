import { ApiError, NotFoundError } from "../../common/utils/error.util";
import { AnalysisRepository } from "./analysis.repository";
import {
  assembleContext,
  classifyQuery,
  extractSubgraph,
  GraphEdge,
  GraphNode,
} from "./analysis.utils.";
import { QueryResponse } from "./analysis.types";
import { queryWithAI } from "./analysis.ai";

export class AnalysisService {
  constructor(public readonly analysisRepository: AnalysisRepository) {}

  async findById(id: string) {
    const analysis = await this.analysisRepository.findById(id);
    if (!analysis) {
      throw new NotFoundError("Analysis", id);
    }

    return analysis;
  }

  async queryAnalysis(id: string, question: string): Promise<QueryResponse> {
    const analysis = await this.analysisRepository.findById(id);

    if (!analysis) {
      throw new NotFoundError("Analysis", id);
    }

    if (analysis.status !== "COMPLETED") {
      throw new ApiError("Analysis is not completed yet", 400, "ANALYSIS_NOT_COMPLETED");
    }

    if (!analysis.graph) {
      throw new ApiError("No graph data available for this analysis", 400, "NO_GRAPH_DATA");
    }

    const graph = analysis.graph as unknown as { nodes: GraphNode[]; edges: GraphEdge[] };
    const queryType = classifyQuery(question);
    const subgraph = extractSubgraph(graph.nodes, graph.edges, question, queryType);
    const repoName = `${analysis.repository?.owner ?? ""}/${analysis.repository?.name ?? ""}`;
    const context = assembleContext(subgraph.nodes, subgraph.edges, question, repoName);

    return queryWithAI(context, question, queryType);
  }
}
