import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Play, Star, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useUIStore } from "@/store/uiStore";
import { PageWrapper } from "@/components/layout/PageWrapper";

interface Module {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  xp: number;
  status: "locked" | "available" | "in_progress" | "completed";
  description: string;
  content: string;
}

const MODULES: Module[] = [
  {
    id: "ahorro-importa",
    title: "¿Qué es el ahorro y por qué importa?",
    emoji: "🐷",
    duration: "5 min",
    xp: 30,
    status: "completed",
    description: "Lo básico del ahorro y cómo cambia tu vida.",
    content:
      "Ahorrar es separar dinero hoy para usarlo mañana. Mientras más temprano empieces, más crece. Ahorrar S/ 50 cada semana = S/ 2,600 al año.",
  },
  {
    id: "interes-compuesto",
    title: "Cómo funciona el interés compuesto",
    emoji: "📈",
    duration: "7 min",
    xp: 40,
    status: "completed",
    description: "El motor que multiplica tu dinero.",
    content:
      "El interés compuesto es ganar intereses sobre los intereses. Cada mes tu dinero genera más dinero, que también genera más. Es como una bola de nieve.",
  },
  {
    id: "que-es-usdc",
    title: "¿Qué es USDC y por qué es seguro?",
    emoji: "💵",
    duration: "6 min",
    xp: 40,
    status: "in_progress",
    description: "Los dólares digitales explicados simple.",
    content:
      "USDC es un dólar digital. Por cada USDC existe un dólar real guardado en un banco regulado. Su valor no cambia: 1 USDC siempre vale 1 USD.",
  },
  {
    id: "solana",
    title: "Solana: el banco sin banco",
    emoji: "⚡",
    duration: "8 min",
    xp: 50,
    status: "available",
    description: "La red que mueve dinero sin comisiones.",
    content:
      "Solana es una red de computadoras que mueve dinero por casi nada. Lo que un banco te cobra S/ 5-15, en Solana cuesta menos de un centavo.",
  },
  {
    id: "metas-financieras",
    title: "Crear tu primera meta financiera",
    emoji: "🎯",
    duration: "5 min",
    xp: 30,
    status: "available",
    description: "Cómo definir y alcanzar metas SMART.",
    content:
      "Una buena meta tiene fecha y monto. Ejemplo: 'Ahorrar S/ 5,000 para diciembre 2025'. Eso son S/ 416 mensuales. Más fácil de pensar así.",
  },
  {
    id: "leer-apy",
    title: "Cómo leer tu rendimiento APY",
    emoji: "📊",
    duration: "4 min",
    xp: 30,
    status: "locked",
    description: "Entiende qué te está dando tu dinero.",
    content:
      "APY = Annual Percentage Yield. Es lo que ganas en un año si dejas tu dinero invertido. 6.5% APY en S/ 1,000 = S/ 65 al año.",
  },
  {
    id: "defi-familias",
    title: "DeFi para familias: lo básico",
    emoji: "🌐",
    duration: "10 min",
    xp: 60,
    status: "locked",
    description: "Finanzas descentralizadas en lenguaje simple.",
    content:
      "DeFi son finanzas sin bancos intermediarios. Tu dinero trabaja directamente en pools donde otros usuarios prestan o intercambian.",
  },
  {
    id: "futuro-familia",
    title: "Planifica el futuro de tu familia",
    emoji: "👨‍👩‍👧‍👦",
    duration: "8 min",
    xp: 50,
    status: "locked",
    description: "Estrategias para metas de largo plazo.",
    content:
      "El futuro de tu familia se planifica hoy. Educación de hijos, vivienda, retiro: todo empieza con una meta clara y aportes regulares.",
  },
];

export default function Learn() {
  const [selected, setSelected] = useState<Module | null>(null);
  const notify = useUIStore((s) => s.notify);

  const completed = MODULES.filter((m) => m.status === "completed").length;
  const totalXp = MODULES.filter((m) => m.status === "completed").reduce(
    (s, m) => s + m.xp,
    0,
  );

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-2">
          📚 Aprende
        </h1>
        <p className="text-text-secondary mt-1">
          Educación financiera diseñada para ti, no para Wall Street.
        </p>
      </div>

      <Card hover={false} className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <ProgressRing
            progress={(completed / MODULES.length) * 100}
            size={100}
            strokeWidth={10}
            color="#F5A623"
          />
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-display font-bold text-xl mb-1">
              {completed} de {MODULES.length} módulos completados
            </h3>
            <Badge color="gold">Nivel: Ahorrador Básico</Badge>
            <div className="mt-3 flex items-center gap-2 text-state-warning">
              <Star size={16} className="fill-current" />
              <span className="font-display font-bold text-lg">{totalXp} XP</span>
              <span className="text-text-secondary text-sm">ganados</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MODULES.map((m, i) => (
          <ModuleCard
            key={m.id}
            module={m}
            index={i}
            onClick={() =>
              m.status === "locked"
                ? notify("Completa los módulos anteriores para desbloquear", "info")
                : setSelected(m)
            }
          />
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-6xl mb-3">{selected.emoji}</div>
              <h3 className="text-2xl font-display font-bold mb-2">
                {selected.title}
              </h3>
              <div className="flex items-center justify-center gap-3 text-sm text-text-secondary">
                <span>⏱ {selected.duration}</span>
                <span>·</span>
                <span className="text-accent-gold">+{selected.xp} XP</span>
              </div>
            </div>

            <div className="bg-bg-tertiary rounded-2xl p-5 text-text-primary leading-relaxed">
              {selected.content}
            </div>

            <div className="bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.15)] rounded-2xl p-4">
              <p className="text-sm text-text-secondary">
                💡 <strong className="text-text-primary">Tip de Kuna:</strong>{" "}
                Aplica este concepto creando una meta o preguntándole a Kuna
                sobre cómo te afecta a ti específicamente.
              </p>
            </div>

            <Button
              fullWidth
              icon={<Check size={16} />}
              onClick={() => {
                notify(`+${selected.xp} XP ganados! 🎉`, "success");
                setSelected(null);
              }}
            >
              Marcar como completado
            </Button>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}

function ModuleCard({
  module,
  index,
  onClick,
}: {
  module: Module;
  index: number;
  onClick: () => void;
}) {
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";

  const statusBadge = isCompleted ? (
    <Badge color="green" icon={<Check size={10} />}>Completado</Badge>
  ) : module.status === "in_progress" ? (
    <Badge color="cyan" icon={<Play size={10} />}>En progreso</Badge>
  ) : isLocked ? (
    <Badge color="neutral" icon={<Lock size={10} />}>Bloqueado</Badge>
  ) : (
    <Badge color="gold">Disponible</Badge>
  );

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isLocked ? { y: -4 } : undefined}
      onClick={onClick}
      className={`text-left bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl p-5 transition ${
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-[rgba(245,166,35,0.3)] cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{module.emoji}</div>
        {statusBadge}
      </div>
      <h3 className="font-display font-semibold mb-2 leading-tight">
        {module.title}
      </h3>
      <p className="text-xs text-text-secondary mb-3">{module.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">⏱ {module.duration}</span>
        <span className="text-accent-gold font-semibold">+{module.xp} XP</span>
      </div>
    </motion.button>
  );
}
