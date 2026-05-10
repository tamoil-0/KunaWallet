import { motion } from "framer-motion";
import type { SavingGoal } from "@/types";
import { formatPEN } from "@/utils/currency";
import { daysUntil } from "@/utils/date";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface Props {
  goal: SavingGoal;
  onClick?: () => void;
}

export function GoalCardCompact({ goal, onClick }: Props) {
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const progress = target > 0 ? (current / target) * 100 : 0;
  const days = goal.target_date ? daysUntil(goal.target_date) : null;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="text-left w-full bg-bg-tertiary border border-[rgba(255,255,255,0.04)] rounded-2xl p-4 hover:border-[rgba(245,166,35,0.3)] transition flex items-center gap-4"
    >
      <ProgressRing
        progress={progress}
        size={64}
        strokeWidth={6}
        color={goal.color || "#F5A623"}
      >
        <span className="text-xl">{goal.icon_emoji}</span>
      </ProgressRing>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold truncate">{goal.title}</p>
        <p className="text-xs text-text-secondary mt-0.5 font-mono">
          {formatPEN(current)} / {formatPEN(target)}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-accent-gold font-semibold">
            {progress.toFixed(0)}% completado
          </span>
          {days != null && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">{days} días restantes</span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}
