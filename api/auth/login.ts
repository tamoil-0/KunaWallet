import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../db/client";
import { users, wallets } from "../../db/schema";
import { signToken } from "../_lib/auth";
import { setCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  try {
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
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
