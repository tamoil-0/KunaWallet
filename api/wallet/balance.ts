import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { wallets, yieldPositions, transactions } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, auth.userId))
    .limit(1);

  if (!wallet) return res.status(404).json({ error: "Wallet no encontrada" });

  // Simulate daily yield accrual on every balance read (capped at once per day)
  const lastYield = wallet.created_at;
  if (
    Number(wallet.balance_usdc) > 0 &&
    lastYield &&
    Date.now() - new Date(lastYield).getTime() > 86_400_000
  ) {
    const dailyRate = Number(wallet.apy_current) / 365 / 100;
    const yieldAmount = Number(wallet.balance_usdc) * dailyRate;
    if (yieldAmount > 0.0001) {
      const newUsdc = Number(wallet.balance_usdc) + yieldAmount;
      const newEarned = Number(wallet.total_earned) + yieldAmount * 3.7;
      await db
        .update(wallets)
        .set({
          balance_usdc: newUsdc.toFixed(6),
          total_earned: newEarned.toFixed(2),
        })
        .where(eq(wallets.id, wallet.id));

      await db.insert(transactions).values({
        user_id: auth.userId,
        wallet_id: wallet.id,
        type: "yield",
        amount_pen: (yieldAmount * 3.7).toFixed(2),
        amount_usdc: yieldAmount.toFixed(6),
        description: "Rendimiento diario auto",
        status: "completed",
      });

      wallet.balance_usdc = newUsdc.toFixed(6);
      wallet.total_earned = newEarned.toFixed(2);
    }
  }

  const positions = await db
    .select()
    .from(yieldPositions)
    .where(eq(yieldPositions.user_id, auth.userId));

  return res.json({ wallet, positions });
}
