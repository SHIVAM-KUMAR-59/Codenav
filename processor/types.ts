export interface AnalyzeRepositoryInput {
  repositoryId: string;
  analysisId: string;
  owner: string;
  name: string;
  defaultBranch: string;
  clonePath: string;
}

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

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  files: LearningPathStep[];
}

export interface LearningPathStep {
  order: number;
  path: string;
  reason: string;
}

export interface RepositoryMetadata {
  name: string;
  owner: string;
  totalFiles: number;
  totalDirectories: number;
  languages: LanguageStat[];
}

export interface AnalysisResult {
  repository: RepositoryMetadata;
  graph: {
    nodes: CodeNode[];
    edges: CodeEdge[];
  };
  modules: Module[];
  entryPoints: EntryPoint[];
  learningPaths: LearningPath[];
  languageStats: LanguageStat[];
}
