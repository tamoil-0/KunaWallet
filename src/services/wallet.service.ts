import { api } from "./api";
import type { Wallet, Transaction, YieldPosition } from "@/types";

export const walletService = {
  async getBalance(): Promise<{ wallet: Wallet; positions: YieldPosition[] }> {
    const res = await api.get("/wallet/balance");
    return res.data;
  },

  async deposit(
    amount_pen: number,
    goal_id?: string,
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    const res = await api.post("/wallet/deposit", { amount_pen, goal_id });
    return res.data;
  },

  async withdraw(amount_pen: number): Promise<{
    wallet: Wallet;
    transaction: Transaction;
  }> {
    const res = await api.post("/wallet/withdraw", { amount_pen });
    return res.data;
  },

  async getTransactions(params?: {
    type?: string;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const res = await api.get("/transactions", { params });
    return res.data;
  },
};
