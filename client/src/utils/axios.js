import axios from "axios";
import { apiBaseURL } from "../config/env";

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("xypher_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    console.log(`[API Response] ${res.status} ${res.config.url}`);
    return res;
  },
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status} ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      console.error("[API Error] No response received. Check if server is running and CORS is configured.");
      console.error("[API Error] Request:", error.request);
    } else {
      console.error("[API Error] Request setup failed:", error.message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("xypher_token");
      if (!location.pathname.includes("/login")) location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
