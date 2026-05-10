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

  const { full_name, email, password, phone, location } = req.body || {};

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length) {
      return res.status(409).json({ error: "Este correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        full_name,
        email: email.toLowerCase(),
        password_hash,
        phone: phone || null,
        location: location || "Puno, Perú",
      })
      .returning();

    const [wallet] = await db
      .insert(wallets)
      .values({
        user_id: user.id,
        balance_pen: "0.00",
        balance_usdc: "0.000000",
        total_earned: "0.00",
        apy_current: "6.50",
        wallet_address: `${user.id.slice(0, 8)}KuNa${user.id.slice(-8)}`.slice(0, 44),
      })
      .returning();

    const token = signToken({ userId: user.id, email: user.email });

    const { password_hash: _ignore, ...safeUser } = user;
    void _ignore;

    return res.status(201).json({ user: safeUser, wallet, token });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
