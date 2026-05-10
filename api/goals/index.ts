import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { savingGoals } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    const goals = await db
      .select()
      .from(savingGoals)
      .where(eq(savingGoals.user_id, auth.userId))
      .orderBy(desc(savingGoals.created_at));

    const total_saved = goals.reduce(
      (sum, g) => sum + Number(g.current_amount || 0),
      0,
    );

    return res.json({ goals, total_saved });
  }

  if (req.method === "POST") {
    const {
      title,
      description,
      target_amount,
      target_date,
      category,
      icon_emoji,
      color,
      auto_save,
      auto_save_amount,
      auto_save_frequency,
    } = req.body || {};

    if (!title || !target_amount) {
      return res.status(400).json({ error: "Título y monto son requeridos" });
    }

    const [goal] = await db
      .insert(savingGoals)
      .values({
        user_id: auth.userId,
        title,
        description: description || null,
        target_amount: Number(target_amount).toFixed(2),
        target_date: target_date || null,
        category: category || "otro",
        icon_emoji: icon_emoji || "🎯",
        color: color || "#F5A623",
        auto_save: !!auto_save,
        auto_save_amount: Number(auto_save_amount || 0).toFixed(2),
        auto_save_frequency: auto_save_frequency || "monthly",
      })
      .returning();

    return res.status(201).json({ goal });
  }

  return res.status(405).end();
});
