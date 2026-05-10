import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowDownLeft, Pencil, Pause, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GoalForm } from "@/components/goals/GoalForm";
import { goalsService } from "@/services/goals.service";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/services/api";
import { formatPEN } from "@/utils/currency";
import { daysUntil } from "@/utils/date";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { SavingGoal } from "@/types";

export default function Goals() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const setWallet = useAuthStore((s) => s.setWallet);
  const wallet = useAuthStore((s) => s.wallet);
  const notify = useUIStore((s) => s.notify);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await goalsService.list();
      setGoals(res.goals);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    if (!depositGoal) return;
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      notify("Monto inválido", "error");
      return;
    }
    if (wallet && amount > Number(wallet.balance_pen)) {
      notify("No tienes saldo suficiente", "error");
      return;
    }
    setDepositLoading(true);
    try {
      const res = await goalsService.deposit(depositGoal.id, amount);
      notify(
        Number(res.goal.current_amount) >= Number(res.goal.target_amount)
          ? `🎉 ¡Meta '${res.goal.title}' completada!`
          : `Aportaste ${formatPEN(amount)} a "${res.goal.title}"`,
        "success",
      );
      // Refresh wallet by re-fetching balance
      try {
        const { walletService } = await import("@/services/wallet.service");
        const bal = await walletService.getBalance();
        setWallet(bal.wallet);
      } catch {
        /* ignore */
      }
      setDepositGoal(null);
      setDepositAmount("");
      load();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setDepositLoading(false);
    }
  }

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const activeGoals = goals.filter((g) => g.status === "active").length;

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-2">
            🎯 Mis Metas de Ahorro
          </h1>
          <p className="text-text-secondary mt-1">
            {activeGoals} {activeGoals === 1 ? "meta activa" : "metas activas"} ·
            Total ahorrado: <span className="text-accent-gold font-semibold">{formatPEN(totalSaved)}</span>
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setCreateOpen(true)}>
          Nueva meta
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={320} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-6xl mb-4">🎯</p>
          <h3 className="text-xl font-display font-semibold mb-2">
            Aún no tienes metas
          </h3>
          <p className="text-text-secondary mb-6">
            Crea tu primera meta y empieza a hacer crecer tu dinero hoy.
          </p>
          <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />}>
            Crear mi primera meta
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCardFull
              key={goal.id}
              goal={goal}
              onDeposit={() => setDepositGoal(goal)}
            />
          ))}
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-3xl border-2 border-dashed border-[rgba(245,166,35,0.3)] hover:border-accent-gold bg-[rgba(245,166,35,0.02)] p-6 flex flex-col items-center justify-center text-center transition group min-h-[280px]"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(245,166,35,0.08)] flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Plus size={28} className="text-accent-gold" />
            </div>
            <p className="font-display font-semibold mb-1">Crear nueva meta</p>
            <p className="text-sm text-text-secondary">
              ¿En qué sueñas? Cuéntale a Kuna o créala aquí.
            </p>
          </button>
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Crear nueva meta"
        size="lg"
      >
        <GoalForm onClose={() => setCreateOpen(false)} onCreated={load} />
      </Modal>

      {/* Deposit modal */}
      <Modal
        open={!!depositGoal}
        onClose={() => {
          setDepositGoal(null);
          setDepositAmount("");
        }}
        title={`Aportar a "${depositGoal?.title}"`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center text-4xl">{depositGoal?.icon_emoji}</div>
          <Input
            label="Monto a aportar"
            type="number"
            prefix="S/"
            placeholder="100.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            hint={wallet ? `Saldo disponible: ${formatPEN(Number(wallet.balance_pen))}` : ""}
          />
          <Button
            onClick={handleDeposit}
            loading={depositLoading}
            fullWidth
            size="lg"
            icon={<ArrowDownLeft size={16} />}
          >
            Aportar a la meta
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}

function GoalCardFull({
  goal,
  onDeposit,
}: {
  goal: SavingGoal;
  onDeposit: () => void;
}) {
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const progress = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const days = goal.target_date ? daysUntil(goal.target_date) : null;
  const months = days ? Math.ceil(days / 30) : null;

  // Projection
  const monthlyAmount = goal.auto_save
    ? goal.auto_save_frequency === "monthly"
      ? Number(goal.auto_save_amount)
      : goal.auto_save_frequency === "weekly"
      ? Number(goal.auto_save_amount) * 4
      : Number(goal.auto_save_amount) * 30
    : 0;
  const projectedMonths = monthlyAmount > 0 ? Math.ceil(remaining / monthlyAmount) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl p-6 hover:border-[rgba(245,166,35,0.3)] transition flex flex-col"
      style={{ borderTopColor: goal.color, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{goal.icon_emoji}</div>
          <div>
            <h3 className="font-display font-bold">{goal.title}</h3>
            <Badge color={goal.status === "completed" ? "green" : "gold"}>
              {goal.status === "completed"
                ? "Completada ✓"
                : goal.status === "paused"
                ? "Pausada"
                : "Activa"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center my-4">
        <ProgressRing
          progress={progress}
          size={130}
          strokeWidth={10}
          color={goal.color || "#F5A623"}
        />
      </div>

      <div className="text-center mb-4">
        <p className="font-mono text-lg">
          <span className="text-accent-gold font-bold">{formatPEN(current)}</span>
          <span className="text-text-muted"> / {formatPEN(target)}</span>
        </p>
        <p className="text-sm text-text-secondary mt-1">
          Faltan {formatPEN(remaining)}
          {days != null && ` · ${days} días`}
        </p>
      </div>

      {projectedMonths != null && projectedMonths < 999 && (
        <div className="bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.15)] rounded-xl p-3 mb-3 flex items-start gap-2 text-sm">
          <Lightbulb size={14} className="text-accent-cyan shrink-0 mt-0.5" />
          <p className="text-text-secondary">
            A este ritmo, llegarás en{" "}
            <span className="text-accent-cyan font-semibold">
              {projectedMonths} {projectedMonths === 1 ? "mes" : "meses"}
            </span>
          </p>
        </div>
      )}

      {goal.auto_save && (
        <div className="bg-bg-tertiary rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Auto-ahorro</p>
            <p className="text-sm font-display font-semibold text-accent-gold">
              {formatPEN(Number(goal.auto_save_amount))} /{" "}
              {goal.auto_save_frequency === "daily"
                ? "día"
                : goal.auto_save_frequency === "weekly"
                ? "semana"
                : "mes"}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-state-success/10 text-state-success font-semibold">
            ON
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-auto">
        <button
          onClick={onDeposit}
          disabled={goal.status === "completed"}
          className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold disabled:opacity-50 hover:brightness-110 transition"
        >
          <ArrowDownLeft size={14} />
          Aportar
        </button>
        <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs">
          <Pencil size={14} />
          Editar
        </button>
        <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs">
          <Pause size={14} />
          Pausar
        </button>
      </div>
    </motion.div>
  );
}
