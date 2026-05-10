import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc, eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { transactions } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const type = req.query.type as string | undefined;

  const filters = [eq(transactions.user_id, auth.userId)];
  if (type && type !== "all") {
    filters.push(eq(transactions.type, type));
  }

  const list = await db
    .select()
    .from(transactions)
    .where(and(...filters))
    .orderBy(desc(transactions.created_at))
    .limit(limit);

  return res.json({ transactions: list, total: list.length });
}
