import { CodeNode, CodeEdge } from "./types";
import path from "path";

export async function buildDependencyGraph(
  clonePath: string
): Promise<{ nodes: CodeNode[]; edges: CodeEdge[] }> {
  const { cruise } = await import("dependency-cruiser");
  const result = await cruise([clonePath], {
    exclude: {
      path: "node_modules|dist|build|\\.git|\\.next",
    },
    doNotFollow: {
      path: "node_modules",
    },
  });

  const output = typeof result.output === "string" ? JSON.parse(result.output) : result.output;

  const nodes: CodeNode[] = [];
  const edges: CodeEdge[] = [];

  for (const module of output.modules ?? []) {
    const relativePath = path.relative(clonePath, module.source);

    nodes.push({
      id: relativePath,
      path: relativePath,
      name: path.basename(relativePath),
      type: "file",
      language: getLanguageFromPath(relativePath),
      size: 0,
    });

    for (const dep of module.dependencies ?? []) {
      const targetPath = path.relative(clonePath, dep.resolved);
      edges.push({
        source: relativePath,
        target: targetPath,
        type: dep.dependencyTypes?.includes("re-export") ? "re-exports" : "imports",
      });
    }
  }

  return { nodes, edges };
}

function getLanguageFromPath(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
  };
  return map[ext] ?? null;
}
