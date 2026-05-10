import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, prefix, className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm text-text-secondary font-medium">{label}</label>
        )}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl border bg-bg-tertiary transition-all",
            error
              ? "border-state-error"
              : "border-[rgba(255,255,255,0.06)] focus-within:border-[rgba(0,212,255,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,212,255,0.12)]",
          )}
        >
          {icon && <span className="text-text-secondary">{icon}</span>}
          {prefix && (
            <span className="text-text-secondary font-mono text-sm">{prefix}</span>
          )}
          <input
            ref={ref}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted text-base",
              className,
            )}
            {...rest}
          />
          {iconRight && <span className="text-text-secondary">{iconRight}</span>}
        </div>
        {error && <span className="text-xs text-state-error">{error}</span>}
        {hint && !error && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
