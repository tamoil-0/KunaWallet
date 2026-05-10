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
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      const type = typeof req.query.type === "string" ? req.query.type : "";
      const params: unknown[] = [auth.userId];
      let where = "where user_id = $1";
      if (type && type !== "all") {
        params.push(type);
        where += " and type = $2";
      }

      const result = await pool.query(
        `select id, user_id, wallet_id, goal_id, type, amount_pen, amount_usdc, exchange_rate, description, status, tx_hash, metadata, created_at
         from transactions
         ${where}
         order by created_at desc
         limit ${limit}`,
        params,
      );

      return res.json({ transactions: result.rows, total: result.rows.length });
    } finally {
      await pool.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en transacciones";
    console.error("[transactions]", err);
    return res.status(500).json({ error: message });
  }
}
