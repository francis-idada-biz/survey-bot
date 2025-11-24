import axios from "axios";

// In production, VITE_API_URL will be your Railway URL.
// In dev, it is undefined, so axios falls back to relative paths (handled by Vite proxy)
const baseURL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;