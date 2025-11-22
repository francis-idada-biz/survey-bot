import axios from "axios";

// Remove baseURL so it uses the current origin (handled by Vite proxy)
const api = axios.create({
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;