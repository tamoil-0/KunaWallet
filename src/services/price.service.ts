import { api } from "./api";
import type { PriceData } from "@/types";

export const priceService = {
  async getUsdcPen(): Promise<PriceData> {
    const res = await api.get<PriceData>("/prices/usdc-pen");
    return res.data;
  },
};
