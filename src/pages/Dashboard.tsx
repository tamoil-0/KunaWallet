import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  TrendingUp,
  Sparkles,
  Wallet as WalletIcon,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { GoalCardCompact } from "@/components/dashboard/GoalCardCompact";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { walletService } from "@/services/wallet.service";
import { goalsService } from "@/services/goals.service";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";
import { formatPEN } from "@/utils/currency";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { SavingGoal, Transaction } from "@/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const setWallet = useAuthStore((s) => s.setWallet);
  const notify = useUIStore((s) => s.notify);

  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<"deposit" | "withdraw" | null>(null);
  const [actionAmount, setActionAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bal, goalsRes, txRes] = await Promise.all([
        walletService.getBalance(),
        goalsService.list(),
        walletService.getTransactions({ limit: 5 }),
      ]);
      setWallet(bal.wallet);
      setGoals(goalsRes.goals);
      setTransactions(txRes.transactions);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction() {
    const amount = Number(actionAmount);
    if (!amount || amount <= 0) {
      notify("Ingresa un monto válido", "error");
      return;
    }
    setActionLoading(true);
    try {
      const res =
        actionModal === "deposit"
          ? await walletService.deposit(amount)
          : await walletService.withdraw(amount);
      setWallet(res.wallet);
      notify(
        actionModal === "deposit"
          ? `Depositaste ${formatPEN(amount)} ✨`
          : `Retiraste ${formatPEN(amount)}`,
        "success",
      );
      setActionModal(null);
      setActionAmount("");
      loadData();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  }

  const balancePEN = wallet ? Number(wallet.balance_pen) : 0;
  const balanceUSDC = wallet ? Number(wallet.balance_usdc) : 0;
  const totalEarned = wallet ? Number(wallet.total_earned) : 0;
  const apy = wallet ? Number(wallet.apy_current) : 6.5;

  // What if all of balance had been at bank's 0.8%
  const bankApy = 0.008;
  const realApy = apy / 100;
  const monthsActive = 6;
  const projectedKunaGain = (balancePEN * realApy * monthsActive) / 12;
  const projectedBankGain = (balancePEN * bankApy * monthsActive) / 12;
  const extraVsBank = projectedKunaGain - projectedBankGain;
  const ratio = bankApy > 0 ? realApy / bankApy : 8;

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      {/* Greeting */}
      <div className="mb-6 hidden lg:block">
        <h1 className="text-2xl font-display font-bold">
          Hola, {user?.full_name?.split(" ")[0] || "amigo"} 👋
        </h1>
        <p className="text-text-secondary">
          Aquí está el panorama de tus ahorros hoy.
        </p>
      </div>

      {/* HERO BALANCE */}
      <Card glass glow="gold" className="mb-6 relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-text-secondary text-xs uppercase tracking-wider mb-2">
              <WalletIcon size={12} />
              Tu balance total
            </div>
            {loading ? (
              <Skeleton width={300} height={56} />
            ) : (
              <p className="font-display font-bold text-4xl lg:text-5xl">
                <CountUp end={balancePEN} prefix="S/ " decimals={2} duration={1.4} />
              </p>
            )}
            <p className="mt-2 text-accent-cyan font-mono text-sm">
              ≈ {balanceUSDC.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC
            </p>
            <p className="mt-1 text-state-success text-sm flex items-center gap-1">
              <TrendingUp size={14} /> +{formatPEN(totalEarned)} ganados desde tu inicio
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <ActionButton
              icon={<ArrowDownLeft size={18} />}
              label="Depositar"
              onClick={() => setActionModal("deposit")}
            />
            <ActionButton
              icon={<ArrowUpRight size={18} />}
              label="Retirar"
              onClick={() => setActionModal("withdraw")}
            />
            <ActionButton
              icon={<RefreshCw size={18} />}
              label="Convertir"
              onClick={() => notify("Próximamente 🚀", "info")}
            />
            <Link
              to="/goals"
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gradient-gold text-bg-primary hover:brightness-110 transition shadow-btn-gold"
            >
              <Plus size={18} />
              <span className="text-xs font-display font-semibold">Nueva meta</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-state-success/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-state-success" />
            </div>
            <Badge color="green" icon={<ShieldCheck size={10} />}>
              Bajo riesgo
            </Badge>
          </div>
          <p className="font-display font-bold text-2xl text-state-success">
            <CountUp end={apy} suffix="% APY" decimals={2} />
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Marinade Finance · Orca USDC Pool
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
              <Sparkles size={20} className="text-accent-gold" />
            </div>
            <Badge color="gold">Acumulado</Badge>
          </div>
          <p className="font-display font-bold text-2xl text-accent-gold">
            <CountUp end={totalEarned} prefix="S/ " decimals={2} />
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Rendimiento total ganado
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
              <WalletIcon size={20} className="text-accent-cyan" />
            </div>
            <Badge color="cyan">{ratio.toFixed(1)}x más</Badge>
          </div>
          <p className="font-display font-bold text-2xl text-accent-cyan">
            +<CountUp end={extraVsBank} prefix="S/ " decimals={2} /> extra
          </p>
          <p className="text-text-secondary text-sm mt-1">
            vs cuenta de ahorro tradicional (0.8%)
          </p>
        </Card>
      </div>

      {/* GOALS + CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 mb-6">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Tus metas activas</h3>
            <Link
              to="/goals"
              className="text-sm text-accent-gold hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <>
                <Skeleton height={88} />
                <Skeleton height={88} />
              </>
            ) : goals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-text-secondary mb-3">Aún no tienes metas</p>
                <Link to="/goals">
                  <Button variant="secondary" size="sm">
                    Crear mi primera meta
                  </Button>
                </Link>
              </div>
            ) : (
              goals
                .slice(0, 3)
                .map((g) => <GoalCardCompact key={g.id} goal={g} />)
            )}
          </div>
        </Card>

        <Card hover={false}>
          <SavingsChart />
        </Card>
      </div>

      {/* TRANSACTIONS + KUNA PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold">Actividad reciente</h3>
            <Link
              to="/transactions"
              className="text-sm text-accent-gold hover:underline flex items-center gap-1"
            >
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={56} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-text-secondary text-sm py-8 text-center">
              Aún no hay movimientos
            </p>
          ) : (
            <div>
              {transactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </Card>

        <Card hover={false} className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-[rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center font-display font-bold text-bg-primary">
                K
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-state-success rounded-full border-2 border-bg-secondary" />
            </div>
            <div>
              <p className="font-display font-semibold">Kuna</p>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-state-success" />
                En línea · Tu asesor IA
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-bg-primary/60 rounded-2xl rounded-tl-md p-4 mb-4 text-sm"
          >
            ¡{user?.full_name?.split(" ")[0] || "Hola"}! Tu meta avanza bien.
            Si ahorras S/ 50 más este mes, llegarás antes de lo planeado. ¿Lo
            hacemos?
          </motion.div>
          <div className="flex flex-wrap gap-2 mb-4">
            <SuggestionChip>💰 Ahorrar más</SuggestionChip>
            <SuggestionChip>📊 Ver análisis</SuggestionChip>
            <SuggestionChip>💬 Hablar</SuggestionChip>
          </div>
          <Link to="/ai-advisor">
            <Button fullWidth icon={<MessageCircle size={16} />} iconRight={<ArrowRight size={16} />}>
              Hablar con Kuna
            </Button>
          </Link>
        </Card>
      </div>

      {/* DEPOSIT / WITHDRAW MODAL */}
      <Modal
        open={!!actionModal}
        onClose={() => {
          setActionModal(null);
          setActionAmount("");
        }}
        title={actionModal === "deposit" ? "Depositar a tu wallet" : "Retirar de tu wallet"}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Monto en soles"
            type="number"
            prefix="S/"
            placeholder="0.00"
            value={actionAmount}
            onChange={(e) => setActionAmount(e.target.value)}
          />
          <div className="bg-bg-tertiary rounded-xl p-3 text-xs text-text-secondary">
            {actionModal === "deposit" ? (
              <>Tu depósito se convertirá automáticamente a USDC y empezará a generar rendimiento de inmediato.</>
            ) : (
              <>El retiro se procesará a tu cuenta vinculada. Saldo disponible: <span className="text-text-primary font-mono">{formatPEN(balancePEN)}</span></>
            )}
          </div>
          <Button onClick={handleAction} loading={actionLoading} fullWidth size="lg">
            Confirmar {actionModal === "deposit" ? "depósito" : "retiro"}
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-bg-tertiary hover:bg-[rgba(245,166,35,0.08)] hover:text-accent-gold transition border border-transparent hover:border-[rgba(245,166,35,0.2)]"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
}

function SuggestionChip({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-1.5 rounded-full text-xs bg-bg-tertiary hover:bg-[rgba(0,212,255,0.1)] hover:text-accent-cyan transition border border-[rgba(255,255,255,0.06)]">
      {children}
    </button>
  );
}
