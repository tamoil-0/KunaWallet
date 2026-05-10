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
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const auth = await authUser(req);
    if (!auth) return res.status(401).json({ error: "No autorizado" });

    const { amount_pen } = req.body || {};
    const amt = Number(amount_pen);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "Monto invalido" });
    }

    const connectionString = dbUrl();
    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL no configurado" });
    }
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 1,
    });

    try {
      await pool.query("begin");
      const walletResult = await pool.query(
        `select id, user_id, balance_pen, balance_usdc, total_earned, apy_current, wallet_address, created_at
         from wallets
         where user_id = $1
         limit 1
         for update`,
        [auth.userId],
      );
      const wallet = walletResult.rows[0];
      if (!wallet) {
        await pool.query("rollback");
        return res.status(404).json({ error: "Wallet no encontrada" });
      }
      if (Number(wallet.balance_pen) < amt) {
        await pool.query("rollback");
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const rate = 3.7;
      const usdcAmt = amt / rate;
      const newPen = Number(wallet.balance_pen) - amt;
      const newUsdc = Math.max(0, Number(wallet.balance_usdc) - usdcAmt);

      const updatedWalletResult = await pool.query(
        `update wallets
         set balance_pen = $1, balance_usdc = $2
         where id = $3
         returning id, user_id, balance_pen, balance_usdc, total_earned, apy_current, wallet_address, created_at`,
        [newPen.toFixed(2), newUsdc.toFixed(6), wallet.id],
      );

      const txResult = await pool.query(
        `insert into transactions
         (user_id, wallet_id, type, amount_pen, amount_usdc, exchange_rate, description, status)
         values ($1,$2,'withdraw',$3,$4,$5,'Retiro a cuenta','completed')
         returning id, user_id, wallet_id, goal_id, type, amount_pen, amount_usdc, exchange_rate, description, status, tx_hash, metadata, created_at`,
        [
          auth.userId,
          wallet.id,
          amt.toFixed(2),
          usdcAmt.toFixed(6),
          rate.toFixed(4),
        ],
      );

      await pool.query("commit");
      return res.json({
        wallet: updatedWalletResult.rows[0],
        transaction: txResult.rows[0],
      });
    } catch (err) {
      await pool.query("rollback").catch(() => undefined);
      throw err;
    } finally {
      await pool.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en retiro";
    console.error("[withdraw]", err);
    return res.status(500).json({ error: message });
  }
}
