import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Mic,
  Trash2,
  MessageSquare,
  Target,
  BarChart3,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { aiService } from "@/services/ai.service";
import { Badge } from "@/components/ui/Badge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { AIMessage } from "@/types";

const STORAGE_KEY = "kuna-chat-history";

const STARTERS = [
  { icon: Target, label: "Crear nueva meta", prompt: "Quiero crear una nueva meta de ahorro. ¿Me ayudas?" },
  { icon: BarChart3, label: "Analizar mis ahorros", prompt: "¿Cómo van mis ahorros? Hazme un análisis." },
  { icon: HelpCircle, label: "¿Qué es USDC?", prompt: "Explícame qué es USDC y por qué es seguro." },
  { icon: Sparkles, label: "Mejorar rendimiento", prompt: "¿Cómo puedo aumentar mi rendimiento sin tomar mucho riesgo?" },
];

export default function AIAdvisor() {
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const notify = useUIStore((s) => s.notify);

  const [messages, setMessages] = useState<AIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AIMessage[]) : [];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await aiService.chat(trimmed, messages);
      const reply: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.response,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, reply]);
    } catch (err) {
      console.error(err);
      notify("Kuna no pudo responder ahora", "error");
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Disculpa, tuve un problema conectándome 😔. Intenta de nuevo en un momento.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function clearChat() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const balancePEN = wallet ? Number(wallet.balance_pen) : 0;

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full grid lg:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-7rem)] lg:h-[calc(100vh-5rem)]">
      {/* CONTEXT PANEL */}
      <aside className="hidden lg:flex flex-col bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl p-6 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center text-4xl font-display font-bold text-bg-primary shadow-cyan animate-pulse-slow">
              K
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-state-success rounded-full border-2 border-bg-secondary" />
          </div>
          <h2 className="font-display font-bold text-lg">Kuna</h2>
          <p className="text-xs text-text-secondary">Tu asesor financiero IA</p>
          <Badge color="green" className="mt-3">
            Disponible 24/7
          </Badge>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 mb-4">
          <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
            Tu contexto
          </p>
          <div className="space-y-1.5 text-sm">
            <ContextRow label="Balance" value={`S/ ${balancePEN.toFixed(2)}`} />
            <ContextRow label="APY" value={`${wallet?.apy_current || "6.50"}%`} />
            <ContextRow label="Ubicación" value={user?.location || "Puno"} />
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 flex-1">
          <p className="text-xs uppercase tracking-wider text-text-secondary mb-3">
            Kuna te ayuda con
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>· Crear o editar metas</li>
            <li>· Analizar tus gastos</li>
            <li>· Explicar conceptos</li>
            <li>· Calcular tiempos</li>
            <li>· Recomendar pools</li>
          </ul>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="mt-4 flex items-center gap-2 text-sm text-text-secondary hover:text-state-error transition"
          >
            <Trash2 size={14} /> Nueva conversación
          </button>
        )}
      </aside>

      {/* CHAT */}
      <section className="flex flex-col bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl overflow-hidden">
        <header className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center font-bold text-bg-primary text-sm">
              K
            </div>
            <div>
              <p className="font-display font-semibold">Kuna</p>
              <p className="text-xs text-text-secondary">Asesor IA · En línea</p>
            </div>
          </div>
          <h3 className="hidden lg:block font-display font-semibold">
            Conversación con Kuna
          </h3>
          <span className="text-xs text-text-secondary">
            {messages.length} mensaje{messages.length === 1 ? "" : "s"}
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center text-2xl font-bold text-bg-primary mb-4 animate-pulse-slow">
                K
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">
                ¡Hola, {user?.full_name?.split(" ")[0] || "amigo"}! 👋
              </h3>
              <p className="text-text-secondary mb-6 max-w-md">
                Soy Kuna, tu asesor financiero. Puedes preguntarme cualquier
                cosa sobre tus ahorros, metas o cómo hacer crecer tu dinero.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-xl w-full">
                {STARTERS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-bg-tertiary hover:bg-[rgba(245,166,35,0.08)] hover:text-accent-gold transition text-left text-sm border border-[rgba(255,255,255,0.04)] hover:border-[rgba(245,166,35,0.2)]"
                  >
                    <s.icon size={16} className="shrink-0" />
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
              </AnimatePresence>
              {typing && <TypingIndicator />}
            </div>
          )}
        </div>

        <footer className="border-t border-[rgba(255,255,255,0.06)] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-bg-tertiary text-text-secondary hover:text-text-primary flex items-center justify-center"
              aria-label="Adjuntar"
            >
              <Paperclip size={16} />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Escribe a Kuna en español..."
              className="flex-1 bg-bg-tertiary border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none outline-none focus:border-[rgba(0,212,255,0.5)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] max-h-32"
            />
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-bg-tertiary text-text-secondary hover:text-text-primary flex items-center justify-center"
              aria-label="Voz"
            >
              <Mic size={16} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl bg-gradient-gold text-bg-primary disabled:opacity-40 hover:brightness-110 flex items-center justify-center shadow-btn-gold"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </form>
        </footer>
      </section>
    </PageWrapper>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function ChatBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center font-bold text-bg-primary text-xs shrink-0">
          K
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-bg-tertiary border-r-2 border-accent-gold rounded-br-md text-text-primary"
            : "bg-bg-primary border border-[rgba(0,212,255,0.15)] rounded-bl-md text-text-primary"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center font-bold text-bg-primary text-xs shrink-0">
        K
      </div>
      <div className="bg-bg-primary border border-[rgba(0,212,255,0.15)] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
        {[0, 0.2, 0.4].map((d, i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-accent-cyan"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: d }}
          />
        ))}
      </div>
    </div>
  );
}
