import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users, wallets } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (req, res) => {
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
});
