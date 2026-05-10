import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { goalsService } from "@/services/goals.service";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";
import { formatPEN } from "@/utils/currency";
import type { GoalCategory } from "@/types";

const CATEGORIES: { value: GoalCategory; label: string; emoji: string; color: string }[] = [
  { value: "educacion", label: "Educación", emoji: "🎓", color: "#00D4FF" },
  { value: "salud", label: "Salud", emoji: "🏥", color: "#00E5A0" },
  { value: "negocio", label: "Negocio", emoji: "🏪", color: "#F5A623" },
  { value: "vivienda", label: "Vivienda", emoji: "🏠", color: "#FF8C42" },
  { value: "viaje", label: "Viaje", emoji: "✈️", color: "#A78BFA" },
  { value: "otro", label: "Otro", emoji: "🎯", color: "#F5A623" },
];

const EMOJIS = ["🎯", "🎓", "🏪", "🏥", "🏠", "💻", "📱", "🚗", "✈️", "🎁", "💍", "👶"];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function GoalForm({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const notify = useUIStore((s) => s.notify);

  const [form, setForm] = useState({
    title: "",
    category: "educacion" as GoalCategory,
    icon_emoji: "🎓",
    color: "#00D4FF",
    target_amount: 1000,
    target_date: getDefaultDate(),
    auto_save_amount: 100,
    auto_save_frequency: "monthly" as "daily" | "weekly" | "monthly",
    auto_save: true,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const monthsToTarget = (() => {
    const monthlyAmount =
      form.auto_save_frequency === "monthly"
        ? form.auto_save_amount
        : form.auto_save_frequency === "weekly"
        ? form.auto_save_amount * 4
        : form.auto_save_amount * 30;
    if (monthlyAmount <= 0) return Infinity;
    return Math.ceil(form.target_amount / monthlyAmount);
  })();

  async function submit() {
    setLoading(true);
    try {
      await goalsService.create({
        title: form.title,
        target_amount: form.target_amount,
        target_date: form.target_date,
        category: form.category,
        icon_emoji: form.icon_emoji,
        color: form.color,
        auto_save: form.auto_save,
        auto_save_amount: form.auto_save_amount,
        auto_save_frequency: form.auto_save_frequency,
      });
      notify("¡Meta creada con éxito! 🎯", "success");
      onCreated();
      onClose();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`flex-1 h-1 rounded-full transition ${
              n <= step ? "bg-gradient-gold" : "bg-bg-tertiary"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display font-semibold text-lg">Cuéntanos de tu meta</h3>

          <Input
            label="¿Qué quieres lograr?"
            placeholder="Ej: Universidad de mi hija"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />

          <div>
            <label className="text-sm text-text-secondary font-medium block mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    update("category", c.value);
                    update("color", c.color);
                    update("icon_emoji", c.emoji);
                  }}
                  className={`p-3 rounded-2xl border text-sm transition ${
                    form.category === c.value
                      ? "border-accent-gold bg-[rgba(245,166,35,0.08)]"
                      : "border-[rgba(255,255,255,0.06)] bg-bg-tertiary hover:border-[rgba(245,166,35,0.2)]"
                  }`}
                >
                  <div className="text-2xl mb-1">{c.emoji}</div>
                  <div className="text-xs">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-medium block mb-2">
              Ícono
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => update("icon_emoji", e)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${
                    form.icon_emoji === e
                      ? "bg-[rgba(245,166,35,0.15)] border border-accent-gold"
                      : "bg-bg-tertiary border border-transparent hover:border-[rgba(245,166,35,0.2)]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="¿Cuánto necesitas?"
            type="number"
            prefix="S/"
            value={form.target_amount}
            onChange={(e) => update("target_amount", Number(e.target.value))}
          />

          <Input
            label="¿Para cuándo?"
            type="date"
            value={form.target_date}
            onChange={(e) => update("target_date", e.target.value)}
          />
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display font-semibold text-lg">Plan de ahorro</h3>

          <div>
            <label className="text-sm text-text-secondary font-medium block mb-2">
              ¿Cuánto puedes ahorrar?
            </label>
            <div className="bg-bg-tertiary rounded-xl p-4">
              <p className="font-display font-bold text-3xl text-accent-gold mb-3">
                {formatPEN(form.auto_save_amount)}
              </p>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={form.auto_save_amount}
                onChange={(e) => update("auto_save_amount", Number(e.target.value))}
                className="w-full accent-accent-gold"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>S/ 50</span>
                <span>S/ 2,000</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-medium block mb-2">
              Frecuencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => update("auto_save_frequency", f)}
                  className={`p-3 rounded-xl text-sm font-medium transition ${
                    form.auto_save_frequency === f
                      ? "bg-gradient-gold text-bg-primary"
                      : "bg-bg-tertiary hover:bg-[rgba(245,166,35,0.08)]"
                  }`}
                >
                  {f === "daily" ? "Diario" : f === "weekly" ? "Semanal" : "Mensual"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] rounded-2xl p-4">
            <p className="text-xs text-text-secondary mb-1">📊 Proyección</p>
            <p className="text-text-primary">
              A este ritmo, alcanzarás tu meta en{" "}
              <span className="font-display font-bold text-accent-cyan">
                {monthsToTarget < 999 ? `${monthsToTarget} meses` : "tiempo indefinido"}
              </span>
            </p>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary cursor-pointer">
            <input
              type="checkbox"
              checked={form.auto_save}
              onChange={(e) => update("auto_save", e.target.checked)}
              className="w-4 h-4 accent-accent-gold"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Activar ahorro automático</p>
              <p className="text-xs text-text-secondary">
                KUNA aportará automáticamente sin que pienses
              </p>
            </div>
          </label>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display font-semibold text-lg">Confirma tu meta</h3>

          <div className="bg-gradient-card border border-[rgba(245,166,35,0.2)] rounded-3xl p-6 text-center">
            <div className="text-5xl mb-3">{form.icon_emoji}</div>
            <h4 className="text-xl font-display font-bold mb-1">{form.title || "Tu meta"}</h4>
            <Badge color="gold" className="mb-4">
              {CATEGORIES.find((c) => c.value === form.category)?.label}
            </Badge>
            <p className="text-3xl font-display font-bold text-gradient-gold mb-2">
              {formatPEN(form.target_amount)}
            </p>
            <p className="text-sm text-text-secondary">
              Para el {new Date(form.target_date).toLocaleDateString("es-PE")}
            </p>
            {form.auto_save && (
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] text-sm">
                <p className="text-text-secondary">Ahorrarás automáticamente</p>
                <p className="font-display font-semibold text-accent-gold">
                  {formatPEN(form.auto_save_amount)}{" "}
                  {form.auto_save_frequency === "daily"
                    ? "diario"
                    : form.auto_save_frequency === "weekly"
                    ? "semanal"
                    : "mensual"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 pt-2">
        {step > 1 ? (
          <Button
            variant="secondary"
            icon={<ChevronLeft size={16} />}
            onClick={() => setStep((s) => s - 1)}
          >
            Atrás
          </Button>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <Button
            iconRight={<ChevronRight size={16} />}
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && (!form.title || !form.target_amount)}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            icon={<Check size={16} />}
            loading={loading}
            onClick={submit}
          >
            Crear meta
          </Button>
        )}
      </div>
    </div>
  );
}

function getDefaultDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 12);
  return d.toISOString().split("T")[0];
}
