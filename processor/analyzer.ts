import { AnalyzeRepositoryInput, AnalysisResult } from "./types";
import { cloneRepository } from "./cloner";
import { detectLanguages } from "./language-detector";
import { buildModuleMap } from "./module-mapper";
import { buildDependencyGraph } from "./graph-builder";
import { detectEntryPoints } from "./entry-point-detector";
import { generateLearningPaths } from "./learning-path-generator";
import { cleanupRepository } from "./cleaner";
import path from "path";

export async function analyzeRepository(input: AnalyzeRepositoryInput): Promise<AnalysisResult> {
  const clonePath = path.join("/tmp/codenav", input.analysisId);

  try {
    // Step 1: Clone repo
    await cloneRepository(input.owner, input.name, clonePath);

    // Step 2: Detect languages
    const languageStats = await detectLanguages(clonePath);

    // Step 3: Build module map
    const modules = await buildModuleMap(clonePath);

    // Step 4: Build dependency graph
    const { nodes, edges } = await buildDependencyGraph(clonePath);

    // Step 5: Detect entry points
    const entryPoints = await detectEntryPoints(clonePath);

    // Step 6: Generate learning paths
    const learningPaths = generateLearningPaths(nodes, edges, entryPoints);

    // Step 7: Count files and directories
    const totalFiles = nodes.filter((n) => n.type === "file").length;
    const totalDirectories = modules.length;

    return {
      repository: {
        name: input.name,
        owner: input.owner,
        totalFiles,
        totalDirectories,
        languages: languageStats,
      },
      graph: { nodes, edges },
      modules,
      entryPoints,
      learningPaths,
      languageStats,
    };
  } finally {
    // Step 8: Cleanup — always runs even if analysis fails
    await cleanupRepository(clonePath);
  }
}
