import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/cors";

let cache: { rate: number; updated_at: string; expires: number } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (cache && cache.expires > Date.now()) {
    return res.json({
      usdc_to_pen: cache.rate,
      pen_to_usdc: 1 / cache.rate,
      updated_at: cache.updated_at,
    });
  }

  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=pen",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!r.ok) throw new Error("coingecko fail");
    const data = (await r.json()) as { "usd-coin"?: { pen?: number } };
    const rate = data["usd-coin"]?.pen || 3.7;
    cache = {
      rate,
      updated_at: new Date().toISOString(),
      expires: Date.now() + 5 * 60_000,
    };
    return res.json({
      usdc_to_pen: rate,
      pen_to_usdc: 1 / rate,
      updated_at: cache.updated_at,
    });
  } catch {
    const fallback = 3.7;
    return res.json({
      usdc_to_pen: fallback,
      pen_to_usdc: 1 / fallback,
      updated_at: new Date().toISOString(),
    });
  }
}
