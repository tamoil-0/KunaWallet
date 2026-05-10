import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { db } from "../../db/client";
import { users, wallets, savingGoals, transactions, aiConversations } from "../../db/schema";
import { requireAuth } from "../_lib/auth";
import { withErrorHandler } from "../_lib/handler";

const SYSTEM_PROMPT_BASE = `Eres Kuna, un asesor financiero amable, empático y claro, especializado en educación financiera para personas de zonas rurales de Puno, Perú. Tu nombre viene de la palabra quechua para "ahora" o "presente".

Reglas de comportamiento:
1. Habla en español simple, sin tecnicismos innecesarios.
2. Cuando menciones USDC, explícalo como "dólares digitales seguros".
3. Cuando menciones Solana, dilo como "la red que mueve el dinero sin cobrar comisiones de banco".
4. Sé empático con metas familiares (educación de hijos, salud, negocio).
5. Da recomendaciones concretas: montos, fechas, frecuencias.
6. Si no sabes algo, admítelo y sugiere consultar con un asesor humano.
7. Celebra los logros aunque sean pequeños. Cada sol ahorrado cuenta.
8. Nunca prometas rendimientos garantizados. Usa "aproximadamente" o "históricamente".
9. Cuando el usuario quiera crear una meta, extrae: nombre, monto objetivo, fecha, frecuencia.
10. Termina algunas respuestas con una pregunta de seguimiento.

Formato:
- Párrafos cortos (2-3 líneas máximo).
- Emojis moderados (1-2 por respuesta).
- Cifras en formato S/ X,XXX.XX (soles) o X.XX USDC.`;

export default withErrorHandler(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { message, history } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Mensaje vacío" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      response:
        "¡Hola! Soy Kuna 🌟. Por ahora estoy en modo demo (sin conexión con IA real). Puedes probar a crear tus metas desde la sección Metas. Cuando agregues tu API key de OpenAI te responderé con consejos personalizados.",
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.user_id, auth.userId))
      .limit(1);
    const goals = await db
      .select()
      .from(savingGoals)
      .where(eq(savingGoals.user_id, auth.userId));
    const lastTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, auth.userId))
      .orderBy(desc(transactions.created_at))
      .limit(5);

    const goalsText = goals.length
      ? goals
          .map(
            (g) =>
              `- ${g.title}: S/ ${Number(g.current_amount).toFixed(2)} de S/ ${Number(g.target_amount).toFixed(2)} (${Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)}%)`,
          )
          .join("\n")
      : "- (Sin metas activas todavía)";

    const txSummary = lastTx
      .map((t) => `- ${t.type}: S/ ${t.amount_pen}`)
      .join("\n");

    const contextPrompt = `${SYSTEM_PROMPT_BASE}

Contexto del usuario actual:
- Nombre: ${user?.full_name || "—"}
- Ubicación: ${user?.location || "Puno"}
- Balance PEN: S/ ${wallet?.balance_pen || "0.00"}
- Balance USDC: ${wallet?.balance_usdc || "0"} USDC
- APY actual: ${wallet?.apy_current || "6.50"}%
- Total ganado: S/ ${wallet?.total_earned || "0.00"}

Metas activas:
${goalsText}

Últimas transacciones:
${txSummary || "(ninguna aún)"}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: contextPrompt },
      ...((history || []) as { role: "user" | "assistant"; content: string }[])
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "Disculpa, no pude responder ahora. Intenta de nuevo.";

    try {
      await db.insert(aiConversations).values([
        { user_id: auth.userId, role: "user", content: message },
        {
          user_id: auth.userId,
          role: "assistant",
          content: responseText,
          tokens_used: completion.usage?.total_tokens || 0,
        },
      ]);
    } catch {
      // ignore log persistence errors
    }

    return res.json({ response: responseText });
  } catch (err) {
    console.error("[ai/chat]", err);
    return res.json({
      response:
        "Tuve un pequeño tropiezo conectándome 😔. Por favor intenta de nuevo en un momento.",
    });
  }
});
