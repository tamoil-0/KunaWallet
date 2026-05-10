import { api } from "./api";
import type { SavingGoal } from "@/types";

export const goalsService = {
  async list(): Promise<{ goals: SavingGoal[]; total_saved: number }> {
    const res = await api.get("/goals");
    return res.data;
  },

  async create(data: Partial<SavingGoal>): Promise<{ goal: SavingGoal }> {
    const res = await api.post("/goals", data);
    return res.data;
  },

  async update(id: string, data: Partial<SavingGoal>): Promise<{ goal: SavingGoal }> {
    const res = await api.put(`/goals/${id}`, data);
    return res.data;
  },

  async deposit(
    id: string,
    amount: number,
  ): Promise<{ goal: SavingGoal }> {
    const res = await api.patch(`/goals/${id}/deposit`, { amount });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
