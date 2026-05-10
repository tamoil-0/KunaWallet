import { useState } from "react";
import { Copy, Wallet as WalletIcon, Shield, Bell, User, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { PageWrapper } from "@/components/layout/PageWrapper";

const TABS = [
  { id: "profile", label: "Mi perfil", icon: User },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "wallet", label: "Wallet", icon: WalletIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const notify = useUIStore((s) => s.notify);
  const [tab, setTab] = useState<TabId>("profile");
  const [notifs, setNotifs] = useState({
    reminders: true,
    yields: true,
    goalsCompleted: true,
    weekly: false,
  });

  const initials = (user?.full_name || "K")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    notify("Copiado al portapapeles", "success");
  }

  return (
    <PageWrapper className="max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Mi perfil</h1>
        <p className="text-text-secondary mt-1">
          Personaliza tu cuenta y preferencias.
        </p>
      </div>

      <Card hover={false} className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center font-display font-bold text-2xl text-bg-primary shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl">{user?.full_name}</h2>
            <p className="text-text-secondary text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge color="gold">📍 {user?.location}</Badge>
              <Badge color="cyan">Nivel: Ahorrador</Badge>
              <Badge color="green">Perfil: Conservador</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 p-1 bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-xl mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              tab === t.id
                ? "bg-bg-tertiary text-accent-gold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card hover={false}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nombre completo" defaultValue={user?.full_name} />
            <Input label="Correo electrónico" defaultValue={user?.email} disabled />
            <Input label="Teléfono" defaultValue={user?.phone || ""} placeholder="+51 ..." />
            <Input label="Ubicación" defaultValue={user?.location} />
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => notify("Cambios guardados", "success")}>
              Guardar cambios
            </Button>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <Card hover={false}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Contraseña actual" type="password" placeholder="••••••••" />
            <Input label="Nueva contraseña" type="password" placeholder="••••••••" />
            <Input label="Confirmar nueva" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-6 p-4 rounded-xl bg-bg-tertiary border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div>
              <p className="font-medium">Autenticación de 2 factores (2FA)</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Añade una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Button variant="secondary" size="sm">Activar</Button>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => notify("Contraseña actualizada", "success")}>
              Actualizar
            </Button>
          </div>
        </Card>
      )}

      {tab === "notifications" && (
        <Card hover={false}>
          <div className="space-y-4">
            <NotifRow
              label="Recordatorios de ahorro"
              hint="Recibe avisos para no olvidar aportar"
              checked={notifs.reminders}
              onChange={(v) => setNotifs({ ...notifs, reminders: v })}
            />
            <NotifRow
              label="Rendimientos diarios"
              hint="Te notificaremos cuánto ganaste cada día"
              checked={notifs.yields}
              onChange={(v) => setNotifs({ ...notifs, yields: v })}
            />
            <NotifRow
              label="Metas completadas"
              hint="Celebra cuando logras una meta"
              checked={notifs.goalsCompleted}
              onChange={(v) => setNotifs({ ...notifs, goalsCompleted: v })}
            />
            <NotifRow
              label="Consejos semanales de Kuna"
              hint="Tips financieros adaptados a tu perfil"
              checked={notifs.weekly}
              onChange={(v) => setNotifs({ ...notifs, weekly: v })}
            />
          </div>
        </Card>
      )}

      {tab === "wallet" && (
        <Card hover={false}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Tu dirección de wallet (Solana)
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary border border-[rgba(255,255,255,0.06)]">
                <span className="font-mono text-sm flex-1 truncate">
                  {wallet?.wallet_address || "—"}
                </span>
                <button
                  onClick={() => wallet?.wallet_address && copy(wallet.wallet_address)}
                  className="text-text-secondary hover:text-accent-gold p-1.5"
                  aria-label="Copiar"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-text-secondary mb-1">Balance USDC</p>
                <p className="font-mono font-bold text-lg">
                  {Number(wallet?.balance_usdc || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-text-secondary mb-1">Balance PEN</p>
                <p className="font-mono font-bold text-lg">
                  S/ {Number(wallet?.balance_pen || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                notify("Próximamente: ver en Solana Explorer", "info");
              }}
              className="block p-3 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.03)] hover:bg-[rgba(0,212,255,0.08)] text-sm text-accent-cyan transition"
            >
              Ver historial completo en Solana Explorer →
            </a>
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}

function NotifRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-bg-tertiary cursor-pointer hover:bg-[rgba(245,166,35,0.04)] transition">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition relative ${
          checked ? "bg-gradient-gold" : "bg-bg-primary border border-[rgba(255,255,255,0.06)]"
        }`}
      >
        <span
          className={`absolute top-0.5 ${
            checked ? "right-0.5" : "left-0.5"
          } w-5 h-5 rounded-full bg-bg-primary transition-all`}
        />
        {checked && <Check size={12} className="absolute top-1.5 left-1.5 text-bg-primary" />}
      </button>
    </label>
  );
}
