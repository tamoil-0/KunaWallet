import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
  glow?: "gold" | "cyan" | "none";
  children: ReactNode;
}

export function Card({
  glass,
  hover = true,
  glow = "none",
  className,
  children,
  ...rest
}: CardProps) {
  const glowClass =
    glow === "gold"
      ? "shadow-gold"
      : glow === "cyan"
      ? "shadow-cyan"
      : "shadow-card";

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-2xl border p-6 transition-colors",
        glass
          ? "glass"
          : "bg-bg-secondary border-[rgba(255,255,255,0.06)] hover:border-[rgba(245,166,35,0.3)]",
        glowClass,
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
