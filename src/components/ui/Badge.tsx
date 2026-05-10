import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeColor = "gold" | "cyan" | "green" | "red" | "neutral";

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  gold: "bg-[rgba(245,166,35,0.15)] border-[rgba(245,166,35,0.3)] text-accent-gold",
  cyan: "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-accent-cyan",
  green: "bg-[rgba(0,229,160,0.12)] border-[rgba(0,229,160,0.3)] text-accent-green",
  red: "bg-[rgba(255,77,109,0.12)] border-[rgba(255,77,109,0.3)] text-state-error",
  neutral: "bg-bg-tertiary border-[rgba(255,255,255,0.08)] text-text-secondary",
};

export function Badge({ color = "gold", children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold",
        colorMap[color],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
