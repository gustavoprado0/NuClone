import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error?.response?.data;
    const status = error?.response?.status;

    console.error("API ERROR:");
    console.error("Status:", status);
    console.error("Data:", data);
    console.error("Message:", error.message);

    return Promise.reject(error);
  }
);
