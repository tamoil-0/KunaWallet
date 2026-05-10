import { api } from "./api";
import type { AIMessage } from "@/types";

export const aiService = {
  async chat(
    message: string,
    history: AIMessage[],
  ): Promise<{
    response: string;
    intent?: string;
    action?: Record<string, unknown>;
  }> {
    const res = await api.post("/ai/chat", { message, history });
    return res.data;
  },
};
