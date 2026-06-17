import api from "./axios";
import { Analysis, QueryResponse } from "../types";

export const analysisApi = {
  getAnalysis: async (id: string): Promise<Analysis> => {
    const res = await api.get(`/analyses/${id}`);
    return res.data.data;
  },

  queryAnalysis: async (id: string, question: string): Promise<QueryResponse> => {
    const res = await api.post(`/analyses/${id}/query`, { question });
    return res.data.data;
  },
};
