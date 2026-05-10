import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT_BASE = `You are Kuna, a warm and clear financial advisor for rural families in Puno, Peru.

Behavior rules:
1. Reply in simple Spanish unless the user writes in English.
2. Avoid technical jargon.
3. Explain USDC as "dolares digitales".
4. Explain Solana as a low-cost network for moving small amounts.
5. Focus on family goals: education, health, business, emergencies.
6. Give concrete suggestions with amounts, dates, and frequencies.
7. Never promise guaranteed returns. Use "estimado" or "aproximado".
8. Keep answers short, friendly, and practical.`;

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

function cors(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
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

function fallbackResponse(message: string) {
  const lower = message.toLowerCase();
  if (
    /\b(hola|buenas|hello|hi|que tal|qué tal)\b/.test(lower) &&
    lower.length < 80
  ) {
    return "Hola, soy Kuna. Estoy aqui para ayudarte a ordenar tus ahorros y convertirlos en metas claras. Puedes preguntarme cosas como: cuanto debo ahorrar cada semana, que meta crear primero, que significa USDC o como va tu progreso actual.";
  }
  if (
    lower.includes("crear") &&
    (lower.includes("meta") || lower.includes("objetivo") || lower.includes("ahorro"))
  ) {
    return "Si, te ayudo. Para crear una buena meta necesito 3 datos: 1) nombre de la meta, por ejemplo universidad, salud o negocio; 2) monto objetivo, por ejemplo S/ 3,000; y 3) fecha limite. Como regla simple, empieza con una meta familiar concreta y un aporte semanal pequeno. En la app puedes ir a Metas > Nueva meta y registrarla en menos de un minuto.";
  }
  if (lower.includes("universidad") || lower.includes("education") || lower.includes("hija")) {
    return "Claro. Para una meta de universidad, primero define el monto total y la fecha. Por ejemplo, si quieres ahorrar S/ 3,000 en 12 meses, necesitas cerca de S/ 250 al mes o S/ 63 por semana. Mi recomendacion es crear la meta en KUNA, hacer aportes semanales y revisar el progreso cada domingo. Lo importante no es empezar grande, sino empezar constante.";
  }
  if (lower.includes("ahorro") || lower.includes("ahorros") || lower.includes("balance")) {
    return "Tus ahorros deben verse como un camino, no solo como un numero. Primero separa una meta principal, luego define un aporte pequeno y constante. Por ejemplo, S/ 50 por semana ya son S/ 2,600 al ano sin contar rendimiento estimado. En KUNA puedes ver balance, metas y movimientos para saber si vas avanzando o si necesitas ajustar el plan.";
  }
  if (lower.includes("rendimiento") || lower.includes("apy") || lower.includes("ganar")) {
    return "El rendimiento en KUNA se muestra como una estimacion educativa, no como una promesa garantizada. La idea es comparar el ahorro tradicional con una alternativa digital mas visible. Si ahorras todos los meses, incluso una diferencia pequena de rendimiento puede importar al final del ano. Lo mas sano es empezar conservador y priorizar metas importantes.";
  }
  if (lower.includes("usdc")) {
    return "USDC es como un dolar digital: mantiene una referencia cercana al valor del dolar y puede ayudarte a proteger parte de tus ahorros frente a la perdida de valor de la moneda local. En KUNA lo mostramos de forma simple para que entiendas tu ahorro sin entrar en detalles tecnicos.";
  }
  if (lower.includes("solana")) {
    return "Solana es una red que permite mover pequenos montos rapidamente y con costos muy bajos. En KUNA la usamos como base para validar una wallet y preparar microtransacciones futuras, sin hacer que el usuario empiece con complejidad tecnica.";
  }
  if (lower.includes("deposit") || lower.includes("depositar") || lower.includes("retiro") || lower.includes("retirar")) {
    return "Para la demo, los depositos y retiros actualizan tu balance y crean una transaccion real en la base de datos. Usalo como simulacion de microahorro: deposita montos pequenos, revisa tu progreso y conecta ese movimiento con una meta concreta.";
  }
  return "Te recomiendo empezar con una meta concreta, un monto pequeno y una frecuencia realista. Por ejemplo: ahorrar S/ 10 cada dia o S/ 50 cada semana. Lo importante es ver progreso y mantener el habito. Si quieres, dime tu meta, el monto y la fecha, y te propongo un plan simple.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  try {
    const auth = await authUser(req);
    if (!auth) return res.status(401).json({ error: "No autorizado" });

    const { message, history } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje vacio" });
    }

    let context = {
      userName: "Maria",
      location: "Puno, Peru",
      balancePen: "0.00",
      balanceUsdc: "0",
      apy: "6.50",
      earned: "0.00",
      goalsText: "- No active goals yet",
      txText: "- No recent transactions",
    };

    const connectionString = dbUrl();
    if (connectionString) {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString,
        ssl: connectionString.includes("localhost")
          ? false
          : { rejectUnauthorized: false },
        max: 1,
      });

      try {
        const [userResult, walletResult, goalsResult, txResult] = await Promise.all([
          pool.query(
            `select full_name, location from users where id = $1 limit 1`,
            [auth.userId],
          ),
          pool.query(
            `select balance_pen, balance_usdc, apy_current, total_earned
             from wallets
             where user_id = $1
             limit 1`,
            [auth.userId],
          ),
          pool.query(
            `select title, current_amount, target_amount
             from saving_goals
             where user_id = $1
             order by created_at desc
             limit 5`,
            [auth.userId],
          ),
          pool.query(
            `select type, amount_pen
             from transactions
             where user_id = $1
             order by created_at desc
             limit 5`,
            [auth.userId],
          ),
        ]);

        const user = userResult.rows[0];
        const wallet = walletResult.rows[0];
        const goals = goalsResult.rows;
        const txs = txResult.rows;

        context = {
          userName: user?.full_name || "Maria",
          location: user?.location || "Puno, Peru",
          balancePen: wallet?.balance_pen || "0.00",
          balanceUsdc: wallet?.balance_usdc || "0",
          apy: wallet?.apy_current || "6.50",
          earned: wallet?.total_earned || "0.00",
          goalsText: goals.length
            ? goals
                .map((g) => {
                  const progress =
                    Number(g.target_amount) > 0
                      ? Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)
                      : 0;
                  return `- ${g.title}: S/ ${Number(g.current_amount).toFixed(2)} of S/ ${Number(g.target_amount).toFixed(2)} (${progress}%)`;
                })
                .join("\n")
            : "- No active goals yet",
          txText: txs.length
            ? txs.map((t) => `- ${t.type}: S/ ${t.amount_pen}`).join("\n")
            : "- No recent transactions",
        };
      } finally {
        await pool.end();
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ response: fallbackResponse(message) });
    }

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `${SYSTEM_PROMPT_BASE}

Current user context:
- Name: ${context.userName}
- Location: ${context.location}
- Balance PEN: S/ ${context.balancePen}
- Balance USDC-style: ${context.balanceUsdc} USDC
- Current APY shown in app: ${context.apy}%
- Total earned shown in app: S/ ${context.earned}

Savings goals:
${context.goalsText}

Recent transactions:
${context.txText}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...((history || []) as { role: "user" | "assistant"; content: string }[])
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 380,
      });

      const response =
        completion.choices[0]?.message?.content || fallbackResponse(message);

      if (connectionString) {
        const { Pool } = await import("pg");
        const pool = new Pool({
          connectionString,
          ssl: connectionString.includes("localhost")
            ? false
            : { rejectUnauthorized: false },
          max: 1,
        });
        try {
          await pool.query(
            `insert into ai_conversations (user_id, role, content, tokens_used)
             values ($1,'user',$2,0), ($1,'assistant',$3,$4)`,
            [auth.userId, message, response, completion.usage?.total_tokens || 0],
          );
        } catch {
          // Logging should never break the AI response.
        } finally {
          await pool.end();
        }
      }

      return res.status(200).json({ response });
    } catch (err) {
      console.error("[ai/openai]", err);
      return res.status(200).json({ response: fallbackResponse(message) });
    }
  } catch (err) {
    console.error("[ai/chat]", err);
    const message = req.body?.message;
    return res.status(200).json({
      response: fallbackResponse(typeof message === "string" ? message : ""),
    });
  }
}
