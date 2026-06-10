import { z } from "zod";

export const SendMagicLinkSchema = z.object({
  email: z.email(),
});

export const VerifyMagicLinkSchema = z.object({
  token: z.string(),
});

export const GithubCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const JwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
});

export const RefreshTokenPayloadSchema = z.object({
  userId: z.string(),
});

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  avatar: string | null;
  joinedAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    avatar: string | null;
    joinedAt: Date;
    updatedAt: Date;
  };
}

export type SendMagicLinkInput = z.infer<typeof SendMagicLinkSchema>;
export type VerifyMagicLinkInput = z.infer<typeof VerifyMagicLinkSchema>;
export type GithubCallbackInput = z.infer<typeof GithubCallbackSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;
