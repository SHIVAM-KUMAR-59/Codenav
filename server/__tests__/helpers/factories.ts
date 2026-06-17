import { AnalysisStatus } from "../../prisma/generated/prisma/index.js";

export const mockUser = (overrides = {}) => ({
  id: "user-1",
  email: "test@example.com",
  githubId: null,
  githubUsername: null,
  githubAvatar: null,
  githubAccessToken: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const mockMagicLink = (overrides = {}) => ({
  id: "magic-link-1",
  token: "valid-token-123",
  email: "test@example.com",
  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  usedAt: null,
  createdAt: new Date(),
  userId: "user-1",
  ...overrides,
});

export const mockRefreshToken = (overrides = {}) => ({
  id: "refresh-token-1",
  token: "refresh-token-123",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  userId: "user-1",
  ...overrides,
});

export const mockRepository = (overrides = {}) => ({
  id: "repo-1",
  url: "https://github.com/expressjs/express",
  owner: "expressjs",
  name: "express",
  defaultBranch: "master",
  latestCommitSha: "abc1234",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockAnalysis = (overrides = {}) => ({
  id: "analysis-1",
  commitSha: "abc1234",
  status: AnalysisStatus.COMPLETED,
  progress: 100,
  message: null,
  error: null,
  startedAt: new Date(),
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  repositoryId: "repo-1",
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
  learningPaths: [],
  languageStats: [{ language: "TypeScript", percentage: 100, fileCount: 2 }],
  ...overrides,
});

export const mockAnalysisWithRepository = (overrides = {}) => ({
  ...mockAnalysis(),
  repository: mockRepository(),
  ...overrides,
});
