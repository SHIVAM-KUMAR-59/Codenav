import { AuthResult, AuthTokens, AuthUser } from "../types";
import api from "./axios";

export const authApi = {
  sendMagicLink: async (email: string): Promise<void> => {
    await api.post("/auth/magic-link/send", { email });
  },

  verifyMagicLink: async (token: string): Promise<AuthResult> => {
    const res = await api.post("/auth/magic-link/verify", { token });
    return res.data.data;
  },

  refresh: async (): Promise<AuthTokens> => {
    const res = await api.post("/auth/refresh");
    return res.data.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get("/auth/me");
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout", {});
  },
};
