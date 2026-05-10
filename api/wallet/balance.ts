import type { VercelRequest, VercelResponse } from "@vercel/node";

function cors(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

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
  if (cors(req, res)) return;
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
      const walletResult = await pool.query(
        `select id, user_id, balance_pen, balance_usdc, total_earned, apy_current, wallet_address, created_at
         from wallets
         where user_id = $1
         limit 1`,
        [auth.userId],
      );

      const wallet = walletResult.rows[0];
      if (!wallet) {
        return res.status(404).json({ error: "Wallet no encontrada" });
      }

      const positionsResult = await pool.query(
        `select id, user_id, pool_name, amount_usdc, apy, risk_level, started_at, last_yield_at
         from yield_positions
         where user_id = $1`,
        [auth.userId],
      );

      return res.json({ wallet, positions: positionsResult.rows });
    } finally {
      await pool.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en balance";
    console.error("[balance]", err);
    return res.status(500).json({ error: message });
  }
}
