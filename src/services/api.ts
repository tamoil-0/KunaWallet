import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register" && path !== "/") {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    // Standard shape: { error: "..." }
    if (data && typeof data === "object" && "error" in data) {
      const e = (data as { error: unknown }).error;
      if (typeof e === "string") return e;
    }
    // Vercel FUNCTION_INVOCATION_FAILED shape: { code, message }
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === "string") {
        return `Error en el servidor: ${m}`;
      }
    }
    if (typeof data === "string") return data;
    return error.message || "Error de conexión";
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Error inesperado";
}
