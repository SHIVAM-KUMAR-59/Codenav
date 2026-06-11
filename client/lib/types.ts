export interface AuthUser {
  id: string;
  email: string;
  avatar: string | null;
  joinedAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

export type Repository = {
  id: string;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  latestCommitSha: string;
  createdAt: string;
  updatedAt: string;
  analyses: Analysis[];
};

export interface LanguageStat {
  language: string;
  percentage: number;
  fileCount: number;
}

export interface CodeNode {
  id: string;
  path: string;
  name: string;
  type: "file" | "module" | "directory";
  language: string | null;
  size: number;
}

export interface CodeEdge {
  source: string;
  target: string;
  type: "imports" | "exports" | "re-exports";
}

export interface Module {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  description: string | null;
  files: string[];
}

export interface EntryPoint {
  id: string;
  path: string;
  type: "server" | "cli" | "export" | "route" | "worker";
  description: string | null;
}

export interface LearningPathStep {
  order: number;
  path: string;
  reason: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  files: LearningPathStep[];
}

export interface Analysis {
  id: string;
  commitSha: string;
  status: string;
  progress: number;
  message: string | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  graph: { nodes: CodeNode[]; edges: CodeEdge[] } | null;
  modules: Module[] | null;
  entryPoints: EntryPoint[] | null;
  learningPaths: LearningPath[] | null;
  languageStats: LanguageStat[] | null;
  repository?: Repository;
}
