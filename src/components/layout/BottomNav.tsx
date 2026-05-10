import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Target, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { to: "/goals", icon: Target, label: "Metas" },
  { to: "/ai-advisor", icon: MessageSquare, label: "Kuna" },
  { to: "/invest", icon: TrendingUp, label: "Invertir" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-secondary/90 backdrop-blur-lg border-t border-[rgba(255,255,255,0.06)] px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] transition ${
                isActive
                  ? "text-accent-gold"
                  : "text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
