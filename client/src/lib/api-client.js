import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors for auth tokens in the future
// apiClient.interceptors.request.use((config) => { ... });

export default apiClient;
