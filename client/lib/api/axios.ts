import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
