import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Inicio" },
    { to: "/login", label: "Ingresar" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.04)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
            K
          </div>
          <span className="font-display font-bold text-lg">
            KUNA <span className="text-text-secondary font-normal">WALLET</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/register"
            className="ml-2 px-5 py-2 rounded-xl text-sm font-display font-semibold bg-gradient-gold text-bg-primary shadow-btn-gold hover:brightness-110 transition"
          >
            Comenzar gratis
          </Link>
        </nav>

        <button
          className="md:hidden text-text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-[rgba(255,255,255,0.04)]"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-base text-text-secondary hover:bg-bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-display font-semibold bg-gradient-gold text-bg-primary text-center"
              >
                Comenzar gratis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/ai-advisor": "Kuna IA",
    "/goals": "Mis Metas",
    "/transactions": "Transacciones",
    "/learn": "Aprende",
    "/invest": "Invertir",
    "/profile": "Mi perfil",
  };
  const title = titleMap[location.pathname] || "KUNA";

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.04)]">
      <div className="px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary text-sm">
            K
          </div>
          <span className="font-display font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-9 h-9 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary"
            aria-label="Salir"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      {user && (
        <div className="px-4 pb-2 text-xs text-text-secondary">
          Hola, <span className="text-text-primary font-medium">{user.full_name.split(" ")[0]}</span>
        </div>
      )}
    </header>
  );
}
