import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";
import { PageWrapper } from "@/components/layout/PageWrapper";

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const notify = useUIStore((s) => s.notify);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await authService.login(data.email, data.password);
      setAuth(res);
      notify("¡Bienvenida de vuelta!", "success");
      navigate("/dashboard");
    } catch (err) {
      notify(getErrorMessage(err), "error", "No pudimos ingresar");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setValue("email", "maria@kuna.pe");
    setValue("password", "demo1234");
  };

  return (
    <PageWrapper className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side */}
      <div className="hidden lg:flex w-1/2 bg-bg-secondary relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-hero pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "url(/pattern-andino.svg)",
            backgroundSize: "60px 60px",
          }}
        />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
            K
          </div>
          <span className="font-display font-bold text-lg">KUNA WALLET</span>
        </Link>

        <div className="relative max-w-md">
          <Sparkles size={24} className="text-accent-gold mb-4" />
          <p className="text-2xl font-display font-semibold leading-tight">
            "Por fin algo donde puedo ahorrar para la universidad de mi hija sin
            que el banco me cobre comisiones cada mes."
          </p>
          <p className="mt-4 text-text-secondary">
            — María Quispe, Comerciante de Puno
          </p>
        </div>

        <div className="relative text-text-muted text-sm">
          Hackathon 2026 · Hecho con 🇵🇪 desde Puno
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
              K
            </div>
            <span className="font-display font-bold">KUNA WALLET</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-display font-bold">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-text-secondary">
            Ingresa con tu correo y contraseña.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Ingresa tu correo",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Formato de correo inválido",
                },
              })}
            />
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register("password", {
                required: "Ingresa tu contraseña",
                minLength: { value: 4, message: "Muy corta" },
              })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-secondary">
                <input type="checkbox" className="accent-accent-gold" />
                Recordarme
              </label>
              <button
                type="button"
                className="text-accent-cyan hover:text-accent-gold"
                onClick={() => alert("Disponible en producción")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
              Ingresar
            </Button>

            <button
              type="button"
              onClick={fillDemo}
              className="mt-2 px-4 py-3 rounded-xl border border-dashed border-[rgba(245,166,35,0.3)] text-sm text-accent-gold hover:bg-[rgba(245,166,35,0.06)] transition flex items-center justify-center gap-2"
            >
              ▶ Probar demo: maria@kuna.pe / demo1234
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-accent-gold font-medium">
              Regístrate gratis
            </Link>
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
