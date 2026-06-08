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
