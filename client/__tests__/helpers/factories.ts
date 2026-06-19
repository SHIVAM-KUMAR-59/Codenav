import type { AuthUser, Repository, Analysis, QueryResponse } from "client/lib/types";

export const mockAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "user-1",
  email: "test@example.com",
  avatar: null,
  joinedAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

export const mockRepository = (overrides: Partial<Repository> = {}): Repository => ({
  id: "repo-1",
  url: "https://github.com/expressjs/express",
  owner: "expressjs",
  name: "express",
  defaultBranch: "master",
  latestCommitSha: "abc1234",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  analyses: [],
  ...overrides,
});

export const mockAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
  id: "analysis-1",
  commitSha: "abc1234",
  status: "COMPLETED",
  progress: 100,
  message: null,
  error: null,
  startedAt: "2024-01-01T00:00:00.000Z",
  completedAt: "2024-01-01T01:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  graph: {
    nodes: [
      {
        id: "src/index.ts",
        path: "src/index.ts",
        name: "index.ts",
        type: "file",
        language: "TypeScript",
        size: 0,
      },
      {
        id: "src/auth.ts",
        path: "src/auth.ts",
        name: "auth.ts",
        type: "file",
        language: "TypeScript",
        size: 0,
      },
    ],
    edges: [{ source: "src/index.ts", target: "src/auth.ts", type: "imports" }],
  },
  modules: [
    {
      id: "src",
      name: "src",
      path: "src",
      fileCount: 2,
      description: null,
      files: ["src/index.ts", "src/auth.ts"],
    },
  ],
  entryPoints: [
    { id: "src/index.ts", path: "src/index.ts", type: "server", description: "Main entry point" },
  ],
  learningPaths: [
    {
      id: "auth-flow",
      title: "Authentication flow",
      description: "How auth works",
      files: [{ order: 1, path: "src/auth.ts", reason: "Auth entry point" }],
    },
  ],
  languageStats: [{ language: "TypeScript", percentage: 100, fileCount: 2 }],
  repository: {
    id: "repo-1",
    url: "https://github.com/expressjs/express",
    owner: "expressjs",
    name: "express",
    defaultBranch: "master",
    latestCommitSha: "abc1234",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    analyses: [],
  },
  ...overrides,
});

export const mockQueryResponse = (overrides: Partial<QueryResponse> = {}): QueryResponse => ({
  explanation: "Authentication works through magic links and GitHub OAuth.",
  files: [
    { path: "src/auth/auth.service.ts", role: "Core auth logic" },
    { path: "src/auth/auth.controller.ts", role: "Request handling" },
  ],
  readingOrder: [
    "src/auth/auth.routes.ts",
    "src/auth/auth.controller.ts",
    "src/auth/auth.service.ts",
  ],
  queryType: "flow",
  ...overrides,
});
