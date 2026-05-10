import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../db/client";
import { users, wallets } from "../../db/schema";
import { signToken } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.user_id, user.id))
    .limit(1);

  const token = signToken({ userId: user.id, email: user.email });
  const { password_hash: _ignore, ...safeUser } = user;
  void _ignore;

  return res.json({ user: safeUser, wallet, token });
});
