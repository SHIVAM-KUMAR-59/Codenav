import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../cloner", () => ({
  cloneRepository: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../language-detector", () => ({
  detectLanguages: vi.fn().mockResolvedValue([
    {
      language: "TypeScript",
      fileCount: 2,
      percentage: 100,
    },
  ]),
}));

vi.mock("../module-mapper", () => ({
  buildModuleMap: vi.fn().mockResolvedValue([
    {
      id: "src",
      name: "src",
      path: "/tmp/codenav/analysis-1/src",
      fileCount: 2,
      description: null,
      files: ["src/index.ts", "src/app.ts"],
    },
  ]),
}));

vi.mock("../graph-builder", () => ({
  buildDependencyGraph: vi.fn().mockResolvedValue({
    nodes: [
      {
        id: "src/index.ts",
        path: "src/index.ts",
        name: "index.ts",
        type: "file",
        language: "TypeScript",
        size: 0,
      },
    ],
    edges: [],
  }),
}));

vi.mock("../entry-point-detector", () => ({
  detectEntryPoints: vi.fn().mockResolvedValue([
    {
      id: "src/index.ts",
      path: "src/index.ts",
      type: "server",
      description: "Server entry point",
    },
  ]),
}));

vi.mock("../learning-path-generator", () => ({
  generateLearningPaths: vi.fn().mockReturnValue([
    {
      id: "request-lifecycle",
      title: "Request lifecycle",
      description: "How requests flow",
      files: [],
    },
  ]),
}));

vi.mock("../cleaner", () => ({
  cleanupRepository: vi.fn().mockResolvedValue(undefined),
}));

import { analyzeRepository } from "../analyzer";
import { cloneRepository } from "../cloner";
import { cleanupRepository } from "../cleaner";

describe("analyzeRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs repository analysis and returns result", async () => {
    const result = await analyzeRepository({
      repositoryId: "repo-1",
      owner: "expressjs",
      name: "express",
      defaultBranch: "main",
      analysisId: "analysis-1",
      clonePath: "/tmp/codenav/analysis-1",
    });

    expect(cloneRepository).toHaveBeenCalledWith("expressjs", "express", "/tmp/codenav/analysis-1");

    expect(result.repository.name).toBe("express");
    expect(result.repository.owner).toBe("expressjs");
    expect(result.repository.totalFiles).toBe(1);
    expect(result.repository.totalDirectories).toBe(1);
    expect(result.languageStats).toEqual([
      {
        language: "TypeScript",
        fileCount: 2,
        percentage: 100,
      },
    ]);

    expect(cleanupRepository).toHaveBeenCalledWith("/tmp/codenav/analysis-1");
  });

  it("cleans up repository even if analysis fails", async () => {
    vi.mocked(cloneRepository).mockRejectedValueOnce(new Error("Clone failed"));

    await expect(
      analyzeRepository({
        repositoryId: "repo-2",
        owner: "bad",
        name: "repo",
        defaultBranch: "main",
        analysisId: "analysis-2",
        clonePath: "/tmp/codenav/analysis-2",
      })
    ).rejects.toThrow("Clone failed");

    expect(cleanupRepository).toHaveBeenCalledWith("/tmp/codenav/analysis-2");
  });
});
