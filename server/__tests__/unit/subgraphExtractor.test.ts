import { extractSubgraph, GraphEdge, GraphNode } from "../../modules/analysis/analysis.utils.";
import { describe, it, expect } from "vitest";

const mockNodes: GraphNode[] = [
  {
    id: "src/auth/auth.service.ts",
    path: "src/auth/auth.service.ts",
    name: "auth.service.ts",
    type: "file",
    language: "TypeScript",
  },
  {
    id: "src/auth/auth.controller.ts",
    path: "src/auth/auth.controller.ts",
    name: "auth.controller.ts",
    type: "file",
    language: "TypeScript",
  },
  {
    id: "src/auth/auth.routes.ts",
    path: "src/auth/auth.routes.ts",
    name: "auth.routes.ts",
    type: "file",
    language: "TypeScript",
  },
  {
    id: "src/repository/repository.service.ts",
    path: "src/repository/repository.service.ts",
    name: "repository.service.ts",
    type: "file",
    language: "TypeScript",
  },
  {
    id: "src/index.ts",
    path: "src/index.ts",
    name: "index.ts",
    type: "file",
    language: "TypeScript",
  },
];

const mockEdges: GraphEdge[] = [
  { source: "src/auth/auth.routes.ts", target: "src/auth/auth.controller.ts", type: "imports" },
  { source: "src/auth/auth.controller.ts", target: "src/auth/auth.service.ts", type: "imports" },
  { source: "src/index.ts", target: "src/auth/auth.routes.ts", type: "imports" },
];

describe("extractSubgraph", () => {
  it("filters out node_modules", () => {
    const nodesWithNodeModules: GraphNode[] = [
      ...mockNodes,
      {
        id: "node_modules/express/index.js",
        path: "node_modules/express/index.js",
        name: "index.js",
        type: "file",
        language: "JavaScript",
      },
    ];
    const result = extractSubgraph(nodesWithNodeModules, mockEdges, "how does auth work", "flow");
    expect(result.nodes.every((n) => !n.path.includes("node_modules"))).toBe(true);
  });

  it("filters out relative paths outside project", () => {
    const nodesWithExternal: GraphNode[] = [
      ...mockNodes,
      {
        id: "../external/file.ts",
        path: "../external/file.ts",
        name: "file.ts",
        type: "file",
        language: "TypeScript",
      },
    ];
    const result = extractSubgraph(nodesWithExternal, mockEdges, "how does auth work", "flow");
    expect(result.nodes.every((n) => !n.path.startsWith("../"))).toBe(true);
  });

  it("returns auth-related nodes for auth flow question", () => {
    const result = extractSubgraph(mockNodes, mockEdges, "how does authentication work", "flow");
    const paths = result.nodes.map((n) => n.path);
    expect(paths.some((p) => p.includes("auth"))).toBe(true);
  });

  it("returns fallback nodes when no keywords match", () => {
    const result = extractSubgraph(mockNodes, mockEdges, "how does xyz123 work", "flow");
    expect(result.nodes.length).toBeGreaterThan(0);
  });

  it("returns affected nodes for impact query", () => {
    const result = extractSubgraph(mockNodes, mockEdges, "what depends on auth service", "impact");
    expect(result.nodes.length).toBeGreaterThan(0);
  });

  it("returns only edges between included nodes", () => {
    const result = extractSubgraph(mockNodes, mockEdges, "how does auth work", "flow");
    const nodeIds = new Set(result.nodes.map((n) => n.id));
    result.edges.forEach((e) => {
      expect(nodeIds.has(e.source)).toBe(true);
      expect(nodeIds.has(e.target)).toBe(true);
    });
  });
});
