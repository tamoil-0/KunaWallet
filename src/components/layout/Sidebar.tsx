import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  ArrowLeftRight,
  GraduationCap,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/ai-advisor", icon: MessageSquare, label: "Kuna IA" },
  { to: "/goals", icon: Target, label: "Mis Metas" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transacciones" },
  { to: "/learn", icon: GraduationCap, label: "Aprende" },
  { to: "/invest", icon: TrendingUp, label: "Invertir" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const initials = (user?.full_name || "K")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-bg-secondary/60 backdrop-blur-md border-r border-[rgba(255,255,255,0.06)] p-5">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
          K
        </div>
        <div>
          <p className="font-display font-bold leading-tight">KUNA</p>
          <p className="text-xs text-text-secondary leading-tight">Wallet</p>
        </div>
      </div>

      {user && (
        <div className="bg-bg-tertiary rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-bg-primary font-display font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-text-secondary truncate">{user.location}</p>
            </div>
          </div>
          <Badge color="gold" className="w-full justify-center">
            Nivel: Ahorrador
          </Badge>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-[rgba(245,166,35,0.12)] text-accent-gold border border-[rgba(245,166,35,0.25)]"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent"
              }`
            }
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-state-error hover:bg-bg-tertiary transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>

      <div className="mt-4 text-center text-xs text-text-muted">
        Powered by <span className="text-accent-cyan">Solana</span>
      </div>
    </aside>
  );
}
