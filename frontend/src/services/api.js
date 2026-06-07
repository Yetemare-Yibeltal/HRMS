// services/api.js
// Central Axios instance with auth token injection.
// All API calls go through this — never fetch() directly in components.

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // proxied to http://localhost:5000 by Vite
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach token automatically ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("hrms_user");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid — clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("hrms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
