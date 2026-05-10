import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";
import { PageWrapper } from "@/components/layout/PageWrapper";

interface FormValues {
  full_name: string;
  email: string;
  phone?: string;
  location: string;
  password: string;
  password_confirm: string;
  terms: boolean;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const notify = useUIStore((s) => s.notify);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { location: "Puno, Perú" } });

  const password = watch("password");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await authService.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        location: data.location,
      });
      setAuth(res);
      setWelcomeOpen(true);
    } catch (err) {
      notify(getErrorMessage(err), "error", "No pudimos crear tu cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-2/5 bg-bg-secondary relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-hero pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
            K
          </div>
          <span className="font-display font-bold text-lg">KUNA WALLET</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-display font-bold leading-tight">
            Tu primera meta
            <br />
            <span className="text-gradient-gold">empieza hoy.</span>
          </h2>
          <ul className="mt-6 space-y-3 text-text-secondary">
            <li className="flex gap-2">✨ Crear cuenta es 100% gratis</li>
            <li className="flex gap-2">🔒 Sin cuenta bancaria requerida</li>
            <li className="flex gap-2">📈 6.5% APY desde el primer sol</li>
            <li className="flex gap-2">🤖 Kuna IA gratis 24/7</li>
          </ul>
        </div>

        <div className="relative text-text-muted text-sm">
          Diseñado en Puno, para el Perú
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary">
              K
            </div>
            <span className="font-display font-bold">KUNA WALLET</span>
          </div>

          <h1 className="text-3xl font-display font-bold">Crea tu cuenta</h1>
          <p className="mt-1 text-text-secondary">
            En 2 minutos estarás ahorrando con rendimiento.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-3">
            <Input
              label="Nombre completo"
              icon={<User size={16} />}
              placeholder="María Quispe"
              error={errors.full_name?.message}
              {...register("full_name", { required: "Tu nombre es requerido" })}
            />
            <Input
              label="Correo electrónico"
              type="email"
              icon={<Mail size={16} />}
              placeholder="tu@correo.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Tu correo es requerido",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Correo inválido" },
              })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Teléfono (opcional)"
                icon={<Phone size={16} />}
                placeholder="+51 987 654 321"
                {...register("phone")}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm text-text-secondary font-medium">
                  Ubicación
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-bg-tertiary">
                  <MapPin size={16} className="text-text-secondary" />
                  <select
                    {...register("location")}
                    className="flex-1 bg-transparent border-none outline-none text-text-primary text-base"
                  >
                    <option value="Puno, Perú">Puno</option>
                    <option value="Juliaca, Puno">Juliaca</option>
                    <option value="Otro - Puno">Otro (Puno)</option>
                  </select>
                </div>
              </div>
            </div>
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
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
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password", {
                required: "Crea una contraseña",
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
              })}
            />
            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              icon={<Lock size={16} />}
              error={errors.password_confirm?.message}
              {...register("password_confirm", {
                required: "Confirma tu contraseña",
                validate: (v) => v === password || "Las contraseñas no coinciden",
              })}
            />

            <label className="flex items-start gap-2 text-sm text-text-secondary mt-1">
              <input
                type="checkbox"
                className="mt-1 accent-accent-gold"
                {...register("terms", { required: "Debes aceptar los términos" })}
              />
              <span>
                Acepto los{" "}
                <a href="#" className="text-accent-gold">
                  términos y condiciones
                </a>
              </span>
            </label>
            {errors.terms && (
              <span className="text-xs text-state-error">{errors.terms.message}</span>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
              iconRight={<ArrowRight size={18} />}
            >
              Crear mi cuenta gratis
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-accent-gold font-medium">
              Ingresa aquí
            </Link>
          </p>
        </motion.div>
      </div>

      <Modal
        open={welcomeOpen}
        onClose={() => {
          setWelcomeOpen(false);
          navigate("/ai-advisor");
        }}
        size="md"
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-5 shadow-gold"
          >
            <PartyPopper size={40} className="text-bg-primary" />
          </motion.div>
          <h3 className="text-2xl font-display font-bold mb-2">
            ¡Bienvenida! 🎉
          </h3>
          <p className="text-text-secondary mb-6">
            Tu wallet KUNA fue creada con éxito. Kuna, tu asesor de IA, ya está
            lista para ayudarte con tu primera meta.
          </p>
          <Button
            onClick={() => {
              setWelcomeOpen(false);
              navigate("/ai-advisor");
            }}
            fullWidth
            size="lg"
            iconRight={<ArrowRight size={18} />}
          >
            Hablar con Kuna
          </Button>
          <button
            onClick={() => {
              setWelcomeOpen(false);
              navigate("/dashboard");
            }}
            className="mt-3 text-sm text-text-secondary hover:text-text-primary"
          >
            Ir al dashboard
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
