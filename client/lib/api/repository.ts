import { Repository } from "../types";
import api from "./axios";

export const repositoryApi = {
  fetchAll: async () => {
    const res = await api.get("/repositories");
    return res.data.data;
  },

  analyze: async (
    url: string
  ): Promise<{ analysisId: string; status: string; cached: boolean }> => {
    const res = await api.post("/repositories/analyze", { url });
    return res.data.data;
  },

  getRepositories: async (): Promise<Repository[]> => {
    const res = await api.get("/repositories");
    return res.data.data;
  },
};
