import { api } from "./api";
import type { AuthResponse, User, Wallet } from "@/types";

export const authService = {
  async register(data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    location?: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },

  async me(): Promise<{ user: User; wallet: Wallet }> {
    const res = await api.get<{ user: User; wallet: Wallet }>("/auth/me");
    return res.data;
  },
};
