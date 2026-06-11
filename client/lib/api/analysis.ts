import api from "./axios";
import { Analysis } from "../types";

export const analysisApi = {
  getAnalysis: async (id: string): Promise<Analysis> => {
    const res = await api.get(`/analyses/${id}`);
    return res.data.data;
  },
};
