import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  Wallet,
  X,
  Check,
  Globe,
} from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { Badge } from "@/components/ui/Badge";
import { PublicNavbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <PageWrapper className="min-h-screen relative overflow-hidden">
      <PublicNavbar />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: "8%", y: "20%", color: "#F5A623", size: 4, delay: 0 },
          { x: "85%", y: "15%", color: "#00D4FF", size: 3, delay: 0.8 },
          { x: "15%", y: "70%", color: "#00E5A0", size: 5, delay: 1.6 },
          { x: "75%", y: "60%", color: "#F5A623", size: 3, delay: 0.4 },
          { x: "45%", y: "35%", color: "#00D4FF", size: 2, delay: 2 },
          { x: "60%", y: "80%", color: "#F5A623", size: 4, delay: 1.2 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: p.x,
              top: p.y,
              width: p.size * 2,
              height: p.size * 2,
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <section className="relative bg-hero">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/pattern-andino.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "60px 60px",
            opacity: 0.025,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
            >
              <motion.div variants={fadeUp}>
                <Badge color="gold" icon={<Sparkles size={12} />}>
                  Powered by Solana · IA financiera
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl md:text-5xl lg:text-[64px] font-display font-bold leading-[1.05] tracking-tight"
              >
                Tu dinero
                <br />
                <span className="text-gradient-gold">trabajando,</span>
                <br />
                no durmiendo.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-text-secondary max-w-xl leading-relaxed"
              >
                Ahorra en soles, gana en dólares. KUNA WALLET es tu asesor
                financiero personal con IA, diseñado para el emprendedor de
                Puno.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-gold text-bg-primary font-display font-semibold shadow-btn-gold hover:brightness-110 transition-all hover:-translate-y-0.5"
                >
                  Comenzar gratis
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl border border-[rgba(245,166,35,0.3)] text-accent-gold hover:bg-[rgba(245,166,35,0.08)] transition"
                >
                  Probar demo
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-state-success" />
                  Sin comisiones abusivas
                </span>
                <span className="flex items-center gap-2">
                  <Zap size={14} className="text-accent-cyan" />
                  En minutos, no días
                </span>
                <span className="flex items-center gap-2">
                  <Wallet size={14} className="text-accent-gold" />
                  Respaldado en USDC
                </span>
              </motion.div>
            </motion.div>

            {/* Phone mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <div className="absolute -inset-10 bg-[radial-gradient(circle,rgba(245,166,35,0.15)_0%,transparent_70%)] pointer-events-none" />
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-[rgba(255,255,255,0.04)] bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          <StatBlock
            value={6.5}
            decimals={1}
            suffix="% APY"
            label="vs 0.8% en banco tradicional peruano"
          />
          <StatBlock
            value={0}
            prefix="S/ "
            suffix=" comisiones"
            label="en micro-transacciones vía Solana"
          />
          <StatBlock
            value={3}
            suffix=" min"
            label="para tu primera meta de ahorro"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <Badge color="cyan">Cómo funciona</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold">
              Tres pasos para que tu dinero crezca
            </h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              Sin filas, sin papeleos, sin comisiones ocultas.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[rgba(245,166,35,0.3)] to-transparent" />
            <Step
              n="1"
              icon={<MessageCircle size={28} />}
              tone="gold"
              title="Cuéntale a Kuna tu meta"
              description="Escribe en español simple: 'Quiero ahorrar 200 soles al mes para los estudios de mi hijo.' Kuna entiende y crea tu plan."
            />
            <Step
              n="2"
              icon={<Zap size={28} />}
              tone="cyan"
              title="Tus soles → USDC"
              description="Convertimos automáticamente tu ahorro a USDC, una moneda digital anclada al dólar, sin trámites bancarios."
            />
            <Step
              n="3"
              icon={<TrendingUp size={28} />}
              tone="green"
              title="Ganas rendimiento auto"
              description="Tu dinero entra a pools de bajo riesgo en Solana y genera hasta 6.5% anual. Sin que hagas nada más."
            />
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="py-20 bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge color="gold">Por qué importa</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold">
              El problema que estamos resolviendo
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-3xl p-8 bg-[rgba(255,77,109,0.04)] border border-[rgba(255,77,109,0.15)]">
              <h3 className="text-xl font-display font-bold mb-5">
                El dinero "bajo el colchón" no crece
              </h3>
              <ul className="space-y-3">
                {[
                  '42% de adultos peruanos no tienen cuenta bancaria formal',
                  'El ahorro informal pierde 3-5% al año por inflación',
                  'Los bancos cobran comisiones que eliminan las ganancias',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-state-error/20 flex items-center justify-center shrink-0">
                      <X size={12} className="text-state-error" />
                    </span>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-3xl p-8 bg-[rgba(0,229,160,0.04)] border border-[rgba(0,229,160,0.15)]">
              <h3 className="text-xl font-display font-bold mb-5">
                KUNA lo hace diferente
              </h3>
              <ul className="space-y-3">
                {[
                  'Sin cuenta bancaria — solo correo o número de teléfono',
                  'Rendimientos reales desde el primer sol ahorrado',
                  'IA que habla como tú y entiende tus metas familiares',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-state-success/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-state-success" />
                    </span>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge color="cyan">Voces de Puno</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold">
              Diseñado con quienes lo usan
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              initials="MQ"
              gradient="from-accent-gold to-accent-gold-dim"
              name="María Quispe"
              role="Comerciante · Puno"
              quote="Por fin algo donde puedo ahorrar para la universidad de mi hija sin que el banco me cobre comisiones todos los meses."
            />
            <Testimonial
              initials="CM"
              gradient="from-accent-cyan to-accent-cyan-dim"
              name="Carlos Mamani"
              role="Estudiante · Juliaca"
              quote="Kuna me explicó qué es USDC en palabras simples. Ya estoy ahorrando para mi laptop y veo cómo crece cada semana."
            />
            <Testimonial
              initials="FT"
              gradient="from-accent-green to-accent-green-dim"
              name="Felipe Ttito"
              role="Bodeguero · Puno"
              quote="Antes guardaba mi dinero en casa. Ahora lo tengo en KUNA y ya gané casi 50 soles extra en el primer mes. ¡Sin esfuerzo!"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <div className="rounded-3xl p-10 lg:p-16 bg-gradient-card border border-[rgba(245,166,35,0.2)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.08)_0%,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Tu primera meta empieza hoy
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Crea tu cuenta gratis en 2 minutos. Sin comisiones ocultas, sin
                trámites bancarios, sin requisitos imposibles.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-gold text-bg-primary font-display font-semibold shadow-btn-gold hover:brightness-110 hover:-translate-y-0.5 transition-all"
              >
                Crear mi cuenta gratis
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(255,255,255,0.04)] py-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <div className="w-7 h-7 rounded-lg bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary text-xs">
              K
            </div>
            <span>KUNA WALLET · Puno, Perú 🇵🇪</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <a href="#" className="hover:text-accent-gold flex items-center gap-1.5">
              ◇ GitHub
            </a>
            <a href="#" className="hover:text-accent-gold flex items-center gap-1.5">
              <Globe size={14} /> Demo en vivo
            </a>
            <span className="text-text-muted">Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </PageWrapper>
  );
}

function StatBlock({
  value,
  prefix,
  suffix,
  decimals = 0,
  label,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center md:border-l md:first:border-none md:border-[rgba(255,255,255,0.06)] md:px-6"
    >
      <div className="font-display font-bold text-4xl md:text-5xl text-gradient-gold">
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          duration={2}
        />
      </div>
      <p className="mt-2 text-text-secondary text-sm">{label}</p>
    </motion.div>
  );
}

function Step({
  n,
  icon,
  tone,
  title,
  description,
}: {
  n: string;
  icon: React.ReactNode;
  tone: "gold" | "cyan" | "green";
  title: string;
  description: string;
}) {
  const toneClasses = {
    gold: "from-accent-gold to-accent-gold-dim text-bg-primary",
    cyan: "from-accent-cyan to-accent-cyan-dim text-bg-primary",
    green: "from-accent-green to-accent-green-dim text-bg-primary",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="relative bg-bg-secondary/60 border border-[rgba(255,255,255,0.06)] rounded-3xl p-7 hover:border-[rgba(245,166,35,0.3)] transition"
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${toneClasses[tone]} flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>
        <span className="font-display font-bold text-5xl text-text-muted/30">
          {n}
        </span>
      </div>
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Testimonial({
  initials,
  gradient,
  name,
  role,
  quote,
}: {
  initials: string;
  gradient: string;
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-bg-secondary border border-[rgba(255,255,255,0.06)] rounded-3xl p-7 hover:border-[rgba(245,166,35,0.3)] transition"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-display font-bold text-bg-primary`}
        >
          {initials}
        </div>
        <div>
          <p className="font-display font-semibold leading-tight">{name}</p>
          <p className="text-sm text-text-secondary leading-tight">{role}</p>
        </div>
      </div>
      <p className="text-text-secondary leading-relaxed">"{quote}"</p>
    </motion.div>
  );
}

/** Phone mockup component — pure SVG/HTML */
function PhoneMockup() {
  return (
    <div className="relative w-[300px] h-[600px] bg-bg-primary rounded-[44px] border-[12px] border-bg-tertiary shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-float">
      <div className="absolute top-0 inset-x-0 h-6 bg-bg-tertiary z-10 flex justify-center items-end pb-1">
        <div className="w-20 h-4 bg-bg-primary rounded-b-2xl" />
      </div>
      <div className="absolute inset-0 bg-hero" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,166,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative h-full p-5 pt-10 flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 text-[10px] text-text-secondary font-mono">
          <span>9:41</span>
          <span>5G · 100%</span>
        </div>

        {/* Greeting */}
        <p className="text-text-secondary text-xs">¡Hola, María 👋</p>
        <p className="font-display font-semibold text-base">Tu balance hoy</p>

        {/* Big balance card */}
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-[rgba(245,166,35,0.2)] shadow-gold">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider">
            Balance total
          </p>
          <p className="text-3xl font-display font-bold mt-1">S/ 1,070.00</p>
          <p className="text-[10px] text-accent-cyan font-mono mt-1">
            ≈ 309.97 USDC
          </p>
          <p className="text-[10px] text-state-success mt-1.5">
            +S/ 1.89 hoy ↑
          </p>
        </div>

        {/* Quick actions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["⬆", "⬇", "🔄"].map((e, i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-base"
            >
              {e}
            </div>
          ))}
        </div>

        {/* Goal preview */}
        <div className="mt-3 p-3 rounded-2xl bg-bg-secondary border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs">🎓 Universidad hija</span>
            <span className="text-[10px] text-accent-gold font-bold">22%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
            <div className="h-full w-[22%] bg-gradient-gold rounded-full" />
          </div>
          <p className="text-[10px] text-text-secondary mt-1.5 font-mono">
            S/ 3,420 / S/ 15,000
          </p>
        </div>

        {/* Kuna chat preview */}
        <div className="mt-auto p-3 rounded-2xl bg-bg-secondary border border-[rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-cyan to-accent-cyan-dim flex items-center justify-center text-[10px] font-bold text-bg-primary">
              K
            </div>
            <span className="text-[10px] font-semibold">Kuna</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-state-success" />
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            ¡María! Si ahorras S/ 50 más este mes, llegarás antes de lo
            planeado 💪
          </p>
        </div>
      </div>
    </div>
  );
}
