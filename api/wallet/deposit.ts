import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { wallets, transactions, savingGoals } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const auth = requireAuth(req, res);
  if (!auth) return;

  const { amount_pen, goal_id } = req.body || {};
  const amt = Number(amount_pen);

  if (!Number.isFinite(amt) || amt <= 0 || amt > 100_000) {
    return res.status(400).json({ error: "Monto inválido (1 - 100,000 PEN)" });
  }

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, auth.userId))
    .limit(1);

  if (!wallet) return res.status(404).json({ error: "Wallet no encontrada" });

  const rate = 3.7;
  const usdcAmt = amt / rate;

  const newPen = Number(wallet.balance_pen) + amt;
  const newUsdc = Number(wallet.balance_usdc) + usdcAmt;

  await db
    .update(wallets)
    .set({
      balance_pen: newPen.toFixed(2),
      balance_usdc: newUsdc.toFixed(6),
    })
    .where(eq(wallets.id, wallet.id));

  let txType: "deposit" | "goal_contribution" = "deposit";
  let description = "Depósito";
  if (goal_id) {
    const [goal] = await db
      .select()
      .from(savingGoals)
      .where(eq(savingGoals.id, goal_id))
      .limit(1);
    if (goal && goal.user_id === auth.userId) {
      const newGoalAmount = Number(goal.current_amount) + amt;
      const completed = newGoalAmount >= Number(goal.target_amount);
      await db
        .update(savingGoals)
        .set({
          current_amount: newGoalAmount.toFixed(2),
          status: completed ? "completed" : goal.status,
          completed_at: completed ? new Date() : goal.completed_at,
        })
        .where(eq(savingGoals.id, goal.id));
      txType = "goal_contribution";
      description = `Aporte a ${goal.title}`;
    }
  }

  const [transaction] = await db
    .insert(transactions)
    .values({
      user_id: auth.userId,
      wallet_id: wallet.id,
      goal_id: goal_id || null,
      type: txType,
      amount_pen: amt.toFixed(2),
      amount_usdc: usdcAmt.toFixed(6),
      exchange_rate: rate.toFixed(4),
      description,
      status: "completed",
      tx_hash: `solana_${Math.random().toString(36).slice(2, 14)}`,
    })
    .returning();

  const [updatedWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.id, wallet.id))
    .limit(1);

  return res.json({ wallet: updatedWallet, transaction });
});
