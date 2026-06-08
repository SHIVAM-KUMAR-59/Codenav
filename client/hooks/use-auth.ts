"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "../lib/api/auth";
import type { AuthResult, AuthTokens } from "../lib/types";

export const useAuth = () => {
  const sendMagicLinkMutation = useMutation({
    mutationFn: (email: string) => authApi.sendMagicLink(email),
  });

  const verifyMagicLinkMutation = useMutation<AuthResult, Error, string>({
    mutationFn: (token: string) => authApi.verifyMagicLink(token),
  });

  const refreshTokenMutation = useMutation<AuthTokens>({
    mutationFn: authApi.refresh,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
  });

  return {
    sendMagicLinkMutation,
    verifyMagicLinkMutation,
    refreshTokenMutation,
    logoutMutation,
  };
};
