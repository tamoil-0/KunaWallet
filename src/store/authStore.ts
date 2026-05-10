import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Wallet } from "@/types";

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: User; wallet: Wallet; token: string }) => void;
  setWallet: (wallet: Wallet) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      wallet: null,
      token: null,
      isAuthenticated: false,
      setAuth: ({ user, wallet, token }) =>
        set({ user, wallet, token, isAuthenticated: true }),
      setWallet: (wallet) => set({ wallet }),
      logout: () =>
        set({ user: null, wallet: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "kuna-auth",
    },
  ),
);
