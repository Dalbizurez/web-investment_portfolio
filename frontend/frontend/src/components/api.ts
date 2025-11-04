// src/components/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://back.g4.atenea.lat/api", 
  withCredentials: true,
});

export default api;
