import type { VercelRequest, VercelResponse } from "@vercel/node";

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

function getConnectionString() {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    const connectionString = getConnectionString();
    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL no configurado" });
    }

    const [{ Pool }, bcrypt, jwt] = await Promise.all([
      import("pg"),
      import("bcryptjs"),
      import("jsonwebtoken"),
    ]);

    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 1,
    });

    try {
      const userResult = await pool.query(
        `select id, full_name, email, phone, avatar_url, location, language, created_at, updated_at, password_hash
         from users
         where email = $1
         limit 1`,
        [String(email).toLowerCase()],
      );

      const user = userResult.rows[0];
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const ok = await bcrypt.default.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const walletResult = await pool.query(
        `select id, user_id, balance_pen, balance_usdc, total_earned, apy_current, wallet_address, created_at
         from wallets
         where user_id = $1
         limit 1`,
        [user.id],
      );

      const { password_hash: _ignore, ...safeUser } = user;
      void _ignore;

      const token = jwt.default.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "kuna-dev-secret-change-me",
        { expiresIn: "7d" },
      );

      return res.status(200).json({
        user: safeUser,
        wallet: walletResult.rows[0] || null,
        token,
      });
    } finally {
      await pool.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en login";
    console.error("[login]", err);
    return res.status(500).json({ error: message });
  }
}
