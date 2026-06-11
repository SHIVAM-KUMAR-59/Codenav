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

export type Analysis = {
  id: string;
  status: "PENDING" | "QUEUED" | "CLONING" | "COMPLETED" | "FAILED" | string;
  progress: number;
  message: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
};

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
