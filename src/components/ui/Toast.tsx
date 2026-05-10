import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

const icons = {
  success: <CheckCircle2 size={20} className="text-state-success" />,
  error: <AlertCircle size={20} className="text-state-error" />,
  info: <Info size={20} className="text-state-info" />,
  warning: <AlertCircle size={20} className="text-state-warning" />,
};

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const remove = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-bg-secondary border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 shadow-card flex items-start gap-3 min-w-[280px]"
          >
            {icons[t.type]}
            <div className="flex-1">
              {t.title && (
                <p className="font-display font-semibold text-sm">{t.title}</p>
              )}
              <p className="text-sm text-text-secondary">{t.message}</p>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-text-muted hover:text-text-primary"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
