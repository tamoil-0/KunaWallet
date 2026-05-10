import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { savingGoals, transactions, wallets } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id requerido" });

  if (req.method === "PATCH" && req.url?.includes("/deposit")) {
    return await handleDeposit(req, res, auth.userId, id);
  }

  if (req.method === "PUT") {
    const data = req.body || {};
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.target_amount !== undefined)
      updates.target_amount = Number(data.target_amount).toFixed(2);
    if (data.target_date !== undefined) updates.target_date = data.target_date;
    if (data.icon_emoji !== undefined) updates.icon_emoji = data.icon_emoji;
    if (data.color !== undefined) updates.color = data.color;
    if (data.status !== undefined) updates.status = data.status;
    if (data.auto_save !== undefined) updates.auto_save = !!data.auto_save;
    if (data.auto_save_amount !== undefined)
      updates.auto_save_amount = Number(data.auto_save_amount).toFixed(2);

    const [goal] = await db
      .update(savingGoals)
      .set(updates)
      .where(and(eq(savingGoals.id, id), eq(savingGoals.user_id, auth.userId)))
      .returning();
    if (!goal) return res.status(404).json({ error: "Meta no existe" });
    return res.json({ goal });
  }

  if (req.method === "DELETE") {
    await db
      .delete(savingGoals)
      .where(and(eq(savingGoals.id, id), eq(savingGoals.user_id, auth.userId)));
    return res.json({ ok: true });
  }

  if (req.method === "GET") {
    const [goal] = await db
      .select()
      .from(savingGoals)
      .where(and(eq(savingGoals.id, id), eq(savingGoals.user_id, auth.userId)))
      .limit(1);
    if (!goal) return res.status(404).json({ error: "Meta no existe" });
    return res.json({ goal });
  }

  return res.status(405).end();
}

async function handleDeposit(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  goalId: string,
) {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  const [goal] = await db
    .select()
    .from(savingGoals)
    .where(and(eq(savingGoals.id, goalId), eq(savingGoals.user_id, userId)))
    .limit(1);
  if (!goal) return res.status(404).json({ error: "Meta no existe" });

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, userId))
    .limit(1);
  if (!wallet) return res.status(404).json({ error: "Wallet no existe" });

  if (Number(wallet.balance_pen) < amount) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  const newGoalAmount = Number(goal.current_amount) + amount;
  const completed = newGoalAmount >= Number(goal.target_amount);

  await db
    .update(savingGoals)
    .set({
      current_amount: newGoalAmount.toFixed(2),
      status: completed ? "completed" : goal.status,
      completed_at: completed ? new Date() : goal.completed_at,
    })
    .where(eq(savingGoals.id, goal.id));

  await db
    .update(wallets)
    .set({
      balance_pen: (Number(wallet.balance_pen) - amount).toFixed(2),
    })
    .where(eq(wallets.id, wallet.id));

  await db.insert(transactions).values({
    user_id: userId,
    wallet_id: wallet.id,
    goal_id: goal.id,
    type: "goal_contribution",
    amount_pen: amount.toFixed(2),
    description: `Aporte a ${goal.title}`,
    status: "completed",
  });

  const [updated] = await db
    .select()
    .from(savingGoals)
    .where(eq(savingGoals.id, goal.id))
    .limit(1);

  return res.json({ goal: updated });
}
