import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Target,
  RefreshCw,
} from "lucide-react";
import type { Transaction } from "@/types";
import { formatPEN } from "@/utils/currency";
import { relativeTime } from "@/utils/date";

const typeMap = {
  deposit: { icon: ArrowDownLeft, color: "text-state-success", bg: "bg-state-success/10", label: "Depósito" },
  withdraw: { icon: ArrowUpRight, color: "text-state-error", bg: "bg-state-error/10", label: "Retiro" },
  yield: { icon: TrendingUp, color: "text-accent-gold", bg: "bg-accent-gold/10", label: "Rendimiento" },
  goal_contribution: { icon: Target, color: "text-accent-cyan", bg: "bg-accent-cyan/10", label: "Meta" },
  convert: { icon: RefreshCw, color: "text-text-secondary", bg: "bg-bg-tertiary", label: "Conversión" },
};

export function TransactionItem({ tx }: { tx: Transaction }) {
  const meta = typeMap[tx.type] || typeMap.deposit;
  const Icon = meta.icon;
  const isPositive = tx.type === "deposit" || tx.type === "yield" || tx.type === "goal_contribution";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={meta.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{tx.description || meta.label}</p>
        <p className="text-xs text-text-secondary">{relativeTime(tx.created_at)}</p>
      </div>
      <div className="text-right">
        <p className={`font-mono font-semibold text-sm ${isPositive ? "text-state-success" : "text-text-primary"}`}>
          {isPositive ? "+" : "-"}{formatPEN(Number(tx.amount_pen))}
        </p>
        {tx.amount_usdc && (
          <p className="text-[10px] text-text-secondary font-mono">
            {Number(tx.amount_usdc).toFixed(4)} USDC
          </p>
        )}
      </div>
    </div>
  );
}
