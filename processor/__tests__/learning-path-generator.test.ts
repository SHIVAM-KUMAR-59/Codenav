import { describe, expect, it } from "vitest";
import { generateLearningPaths } from "../learning-path-generator";
import { CodeEdge, CodeNode, EntryPoint } from "../types";

const nodes: CodeNode[] = [
  {
    id: "server.ts",
    path: "server.ts",
    name: "server.ts",
    type: "file",
    language: "TypeScript",
    size: 0,
  },
  {
    id: "routes/auth.route.ts",
    path: "routes/auth.route.ts",
    name: "auth.route.ts",
    type: "file",
    language: "TypeScript",
    size: 0,
  },
  {
    id: "services/auth.service.ts",
    path: "services/auth.service.ts",
    name: "auth.service.ts",
    type: "file",
    language: "TypeScript",
    size: 0,
  },
  {
    id: "repositories/user.repository.ts",
    path: "repositories/user.repository.ts",
    name: "user.repository.ts",
    type: "file",
    language: "TypeScript",
    size: 0,
  },
  {
    id: "workers/analysis.worker.ts",
    path: "workers/analysis.worker.ts",
    name: "analysis.worker.ts",
    type: "file",
    language: "TypeScript",
    size: 0,
  },
];

const edges: CodeEdge[] = [
  {
    source: "server.ts",
    target: "routes/auth.route.ts",
    type: "imports",
  },
  {
    source: "routes/auth.route.ts",
    target: "services/auth.service.ts",
    type: "imports",
  },
  {
    source: "services/auth.service.ts",
    target: "repositories/user.repository.ts",
    type: "imports",
  },
];

const entryPoints: EntryPoint[] = [
  {
    id: "server.ts",
    path: "server.ts",
    type: "server",
    description: "Server entry point",
  },
];

describe("generateLearningPaths", () => {
  it("generates auth learning path when auth files exist", () => {
    const result = generateLearningPaths(nodes, edges, entryPoints);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "auth-flow",
          title: "Authentication flow",
        }),
      ])
    );
  });

  it("generates request lifecycle path from server entry point", () => {
    const result = generateLearningPaths(nodes, edges, entryPoints);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "request-lifecycle",
          title: "Request lifecycle",
        }),
      ])
    );
  });

  it("generates database layer path when repository files exist", () => {
    const result = generateLearningPaths(nodes, edges, entryPoints);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "database-layer",
          title: "Database layer",
        }),
      ])
    );
  });

  it("generates worker path when worker files exist", () => {
    const result = generateLearningPaths(nodes, edges, entryPoints);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "worker-queue",
          title: "Worker and queue flow",
        }),
      ])
    );
  });

  it("returns empty array when no matching files exist", () => {
    const result = generateLearningPaths([], [], []);

    expect(result).toEqual([]);
  });
});
