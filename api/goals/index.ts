import type { VercelRequest, VercelResponse } from "@vercel/node";

function dbUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_POSTGRES_URL ||
    process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
    ""
  );
}

async function authUser(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const jwt = await import("jsonwebtoken");
  try {
    return jwt.default.verify(
      header.slice(7),
      process.env.JWT_SECRET || "kuna-dev-secret-change-me",
    ) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const auth = await authUser(req);
    if (!auth) return res.status(401).json({ error: "No autorizado" });

    const { Pool } = await import("pg");
    const connectionString = dbUrl();
    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL no configurado" });
    }
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 1,
    });

    try {
      if (req.method === "GET") {
        const result = await pool.query(
          `select id, user_id, title, description, target_amount, current_amount, target_date, currency, category, icon_emoji, color, status, auto_save, auto_save_amount, auto_save_frequency, created_at, completed_at
           from saving_goals
           where user_id = $1
           order by created_at desc`,
          [auth.userId],
        );
        const total_saved = result.rows.reduce(
          (sum, g) => sum + Number(g.current_amount || 0),
          0,
        );
        return res.json({ goals: result.rows, total_saved });
      }

      if (req.method === "POST") {
        const body = req.body || {};
        if (!body.title || !body.target_amount) {
          return res.status(400).json({ error: "Titulo y monto requeridos" });
        }
        const result = await pool.query(
          `insert into saving_goals
           (user_id, title, description, target_amount, target_date, category, icon_emoji, color, auto_save, auto_save_amount, auto_save_frequency)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           returning *`,
          [
            auth.userId,
            body.title,
            body.description || null,
            Number(body.target_amount).toFixed(2),
            body.target_date || null,
            body.category || "otro",
            body.icon_emoji || "🎯",
            body.color || "#F5A623",
            !!body.auto_save,
            Number(body.auto_save_amount || 0).toFixed(2),
            body.auto_save_frequency || "monthly",
          ],
        );
        return res.status(201).json({ goal: result.rows[0] });
      }

      return res.status(405).end();
    } finally {
      await pool.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en metas";
    console.error("[goals]", err);
    return res.status(500).json({ error: message });
  }
}
