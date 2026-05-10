import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { wallets, transactions } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const auth = requireAuth(req, res);
  if (!auth) return;

  const { amount_pen } = req.body || {};
  const amt = Number(amount_pen);

  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, auth.userId))
    .limit(1);

  if (!wallet) return res.status(404).json({ error: "Wallet no encontrada" });
  if (Number(wallet.balance_pen) < amt) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  const rate = 3.7;
  const usdcAmt = amt / rate;
  const newPen = Number(wallet.balance_pen) - amt;
  const newUsdc = Math.max(0, Number(wallet.balance_usdc) - usdcAmt);

  await db
    .update(wallets)
    .set({
      balance_pen: newPen.toFixed(2),
      balance_usdc: newUsdc.toFixed(6),
    })
    .where(eq(wallets.id, wallet.id));

  const [transaction] = await db
    .insert(transactions)
    .values({
      user_id: auth.userId,
      wallet_id: wallet.id,
      type: "withdraw",
      amount_pen: amt.toFixed(2),
      amount_usdc: usdcAmt.toFixed(6),
      exchange_rate: rate.toFixed(4),
      description: "Retiro a cuenta",
      status: "completed",
    })
    .returning();

  const [updatedWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.id, wallet.id))
    .limit(1);

  return res.json({ wallet: updatedWallet, transaction });
});
