import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users, wallets } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: "Usuario no existe" });

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, user.id))
    .limit(1);

  const { password_hash: _ignore, ...safeUser } = user;
  void _ignore;
  return res.json({ user: safeUser, wallet });
}
