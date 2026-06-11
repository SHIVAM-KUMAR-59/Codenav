import api from "./axios";

export const repositoryApi = {
  fetchAll: async () => {
    const res = await api.get("/repositories");
    return res.data.data;
  },
};
