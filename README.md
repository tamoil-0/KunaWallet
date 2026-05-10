# 🌟 KUNA WALLET

> **Tu dinero trabajando, no durmiendo.**
> Billetera educativa Web3 con IA para inclusión financiera en Puno, Perú.

---

## 🎯 El problema

En zonas rurales de Puno, Perú:

- **42%** de adultos peruanos no tienen cuenta bancaria formal *(BCRP 2024)*.
- El ahorro informal *("bajo el colchón")* pierde **3-5%/año** por inflación.
- Los bancos tradicionales pagan **0.8% APY** y cobran comisiones que eliminan las ganancias.
- Las herramientas DeFi existen, pero hablan inglés y suenan a Wall Street.

## 💡 La solución

KUNA WALLET es una billetera digital que:

1. **Convierte automáticamente** tus ahorros en soles (PEN) a USDC (dólares digitales).
2. **Genera 6.5% APY** en pools de bajo riesgo en la red Solana (Marinade, Orca).
3. **Habla contigo en español simple** mediante "Kuna", un asesor IA que entiende metas familiares ("Quiero ahorrar para la universidad de mi hija").
4. **Sin cuenta bancaria, sin comisiones bancarias** — solo necesitas tu correo.

## 🚀 Demo

> **URL:** *(añadir tras desplegar en Vercel)*
>
> **Credenciales demo:** `maria@kuna.pe` / `demo1234`

## 🏗 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS · Framer Motion · Zustand · Recharts · React Router |
| Backend | Vercel Serverless Functions · Node.js |
| Base de datos | Vercel Postgres (Neon) · Drizzle ORM |
| Autenticación | JWT + bcrypt |
| IA | OpenAI GPT-4o-mini |
| Precios | CoinGecko API |
| Deploy | Vercel |

## 🗂 Estructura del proyecto

```
kuna-wallet/
├── api/                # Vercel Serverless Functions
│   ├── auth/           # register, login, me
│   ├── wallet/         # balance, deposit, withdraw
│   ├── goals/          # CRUD + deposit a meta
│   ├── transactions/   # listado
│   ├── ai/chat.ts      # Kuna IA — proxy OpenAI
│   └── prices/         # USDC ↔ PEN (CoinGecko)
├── db/
│   ├── schema.ts       # Drizzle schema
│   ├── seed.ts         # Datos demo
│   └── client.ts       # Pool postgres
├── src/
│   ├── components/     # ui/, layout/, dashboard/, goals/, charts/
│   ├── pages/          # Landing, Login, Register, Dashboard, AIAdvisor, Goals, Transactions, Learn, Invest, Profile
│   ├── store/          # authStore, uiStore (Zustand)
│   ├── services/       # api.ts + servicios HTTP
│   ├── utils/, types/
│   └── App.tsx
├── public/             # SVGs (logo, favicon, pattern andino)
└── vercel.json
```

## 🛠 Setup local

### Requisitos

- Node.js 18+
- Cuenta en [Vercel](https://vercel.com) con un Postgres creado
- API key de [OpenAI](https://platform.openai.com/api-keys) *(opcional — sin ella, Kuna responde con un mensaje de demo)*

### Pasos

```bash
# 1. Instalar
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Edita .env.local y pega:
#   DATABASE_URL=postgres://...
#   JWT_SECRET=cualquier_string_largo_y_seguro_de_32+_caracteres
#   OPENAI_API_KEY=sk-...

# 3. Crear tablas en Postgres
npm run db:push

# 4. Cargar datos demo (María, Carlos, metas, transacciones)
npm run db:seed

# 5. Levantar servidor de desarrollo
npm run dev          # Solo frontend en http://localhost:5173

# Para probar el frontend + las API routes localmente:
npx vercel dev       # Levanta todo en http://localhost:3000
```

## 📋 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor Vite (solo frontend) |
| `npm run build` | TypeScript + producción Vite |
| `npm run preview` | Preview del build |
| `npm run db:push` | Aplicar schema a Postgres |
| `npm run db:seed` | Cargar datos demo |
| `npm run db:studio` | Drizzle Studio (GUI de DB) |

## 🚢 Deploy en Vercel

```bash
# Opción rápida con Vercel CLI
npm i -g vercel
vercel

# O conecta el repo desde dashboard de Vercel:
# 1. Importa el repo
# 2. Agrega las variables de entorno (Settings → Environment Variables):
#    - DATABASE_URL
#    - JWT_SECRET
#    - OPENAI_API_KEY
# 3. Deploy
```

Vercel detecta automáticamente Vite + el folder `/api/` para serverless.

## 📊 Métricas para el pitch

| Métrica | KUNA | Banco peruano |
|---------|-----:|-------------:|
| APY promedio | **6.5%** | 0.8% |
| Comisión por tx | **<S/ 0.01** | S/ 5–15 |
| Tiempo para abrir cuenta | **2 min** | 1–3 días |
| Requisito mínimo | Solo correo | DNI + comprobante de domicilio + ingresos |

**Ejemplo:** Ahorrando S/ 500/mes durante 1 año:

- Banco: S/ 6,000 + S/ 24 = **S/ 6,024**
- KUNA:  S/ 6,000 + S/ 243 = **S/ 6,243** *(+S/ 219 extra)*

## 🧠 Kuna IA — el agente

Kuna usa **GPT-4o-mini** con un system prompt cuidadosamente diseñado:

- Explica USDC como *"dólares digitales seguros"*
- Llama a Solana *"la red que mueve dinero sin comisiones de banco"*
- Recibe el contexto del usuario en cada mensaje (balance, metas, últimas tx)
- Nunca promete rendimientos garantizados (usa "aproximadamente")
- Celebra los logros pequeños

El historial de cada conversación se guarda en `ai_conversations` para análisis posterior.

## 🎨 Design system

- **Paleta:** dark mode con dorado inca `#F5A623` + cian futurista `#00D4FF` + verde rendimiento `#00E5A0`
- **Tipografía:** Space Grotesk (display) + DM Sans (body) + JetBrains Mono (números)
- **Patrón andino sutil** como overlay (`/public/pattern-andino.svg`)
- **Animaciones:** Framer Motion (page transitions, stagger, hover lifts, count-up)

## 🤝 Equipo

Desarrollado para el Hackathon 2026 desde **Puno, Perú** 🇵🇪.

## 📜 Licencia

MIT — usa este código como inspiración para tus propios proyectos de inclusión financiera.
