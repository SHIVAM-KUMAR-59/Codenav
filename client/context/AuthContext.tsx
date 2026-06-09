"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "../lib/api/auth";
import { tokenStore } from "client/lib/api/axios";
import { AuthUser } from "client/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function silentRefresh() {
      try {
        const tokens = await authApi.refresh();

        tokenStore.set(tokens.accessToken);
        setAccessToken(tokens.accessToken);

        const authUser = await authApi.me();
        setUser(authUser);
      } catch {
        tokenStore.set(null);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    silentRefresh();
  }, []);

  const setAuth = (token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setUser(authUser);
    tokenStore.set(token);
  };

  const logout = async () => {
    if (accessToken) {
      try {
        tokenStore.set(null);
        setAccessToken(null);
        setUser(null);
        await authApi.logout();
      } catch {
        // proceed with logout even if API call fails
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
