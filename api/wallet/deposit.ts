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

    const { amount_pen, goal_id } = req.body || {};
    const amt = Number(amount_pen);
    if (!Number.isFinite(amt) || amt <= 0 || amt > 100_000) {
      return res.status(400).json({ error: "Monto invalido (1 - 100,000 PEN)" });
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

      const rate = 3.7;
      const usdcAmt = amt / rate;
      const newPen = Number(wallet.balance_pen) + amt;
      const newUsdc = Number(wallet.balance_usdc) + usdcAmt;

      const updatedWalletResult = await pool.query(
        `update wallets
         set balance_pen = $1, balance_usdc = $2
         where id = $3
         returning id, user_id, balance_pen, balance_usdc, total_earned, apy_current, wallet_address, created_at`,
        [newPen.toFixed(2), newUsdc.toFixed(6), wallet.id],
      );

      let txType = "deposit";
      let description = "Deposito";
      let finalGoalId = goal_id || null;

      if (goal_id) {
        const goalResult = await pool.query(
          `select id, user_id, title, target_amount, current_amount, status, completed_at
           from saving_goals
           where id = $1 and user_id = $2
           limit 1
           for update`,
          [goal_id, auth.userId],
        );
        const goal = goalResult.rows[0];
        if (goal) {
          const newGoalAmount = Number(goal.current_amount) + amt;
          const completed = newGoalAmount >= Number(goal.target_amount);
          await pool.query(
            `update saving_goals
             set current_amount = $1, status = $2, completed_at = $3
             where id = $4`,
            [
              newGoalAmount.toFixed(2),
              completed ? "completed" : goal.status,
              completed ? new Date() : goal.completed_at,
              goal.id,
            ],
          );
          txType = "goal_contribution";
          description = `Aporte a ${goal.title}`;
        } else {
          finalGoalId = null;
        }
      }

      const txResult = await pool.query(
        `insert into transactions
         (user_id, wallet_id, goal_id, type, amount_pen, amount_usdc, exchange_rate, description, status, tx_hash)
         values ($1,$2,$3,$4,$5,$6,$7,$8,'completed',$9)
         returning id, user_id, wallet_id, goal_id, type, amount_pen, amount_usdc, exchange_rate, description, status, tx_hash, metadata, created_at`,
        [
          auth.userId,
          wallet.id,
          finalGoalId,
          txType,
          amt.toFixed(2),
          usdcAmt.toFixed(6),
          rate.toFixed(4),
          description,
          `solana_${Math.random().toString(36).slice(2, 14)}`,
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
    const message = err instanceof Error ? err.message : "Error en deposito";
    console.error("[deposit]", err);
    return res.status(500).json({ error: message });
  }
}
