# KUNA Wallet

**Tu dinero trabajando, no durmiendo.**

KUNA Wallet is a mobile-first Web3 educational savings wallet built for financial inclusion in rural Puno, Peru. It helps users create savings goals, understand digital-dollar savings, track balances and transactions, learn finance through a Spanish AI advisor, and link a real Solana/Phantom public address on Devnet.

Live demo: https://kuna-wallet.vercel.app  
Repository: https://github.com/tamoil-0/KunaWallet  
Demo login: `maria@kuna.pe` / `demo1234`

---

## The Problem

In rural communities, many families still save informally: cash at home, "under the mattress", or in non-digital systems. That money does not grow, loses purchasing power, and does not help build access to modern financial tools.

Key pain points:

- A large share of adults in Peru still have limited or incomplete access to formal financial services.
- Informal savings can lose around 3-5% per year through inflation and loss of purchasing power.
- Traditional banks can feel distant, bureaucratic, and fee-heavy for low-income or rural users.
- DeFi tools exist, but most are too technical, English-first, and not designed for family savings goals.
- Families do not need trading dashboards. They need simple savings, education, trust, and visibility.

Core insight:

> El dinero bajo el colchon no crece.

## The Solution

KUNA Wallet turns saving into a simple, educational, mobile experience.

Users can:

- Create an account with email.
- View PEN and USDC-style balances.
- Create family savings goals.
- Deposit and withdraw demo funds.
- Track real transactions stored in PostgreSQL.
- Compare potential yield against traditional savings.
- Learn finance through short educational modules.
- Chat with "Kuna", a Spanish AI financial advisor.
- Link a Solana/Phantom public address, validate it with `@solana/web3.js`, read Devnet SOL balance, and open it in Solana Explorer.

KUNA is not trying to bring Wall Street to Puno. It brings useful, understandable financial tools to families who need clarity first.

## Hackathon Tracks

### Virtuals

KUNA integrates a Spanish AI advisor that receives user context, including wallet balance, savings goals, and recent transactions. The assistant explains concepts like savings, digital dollars, yield, and risk in simple language adapted to family goals.

Code: [`api/ai/chat.ts`](./api/ai/chat.ts)

### Solana Mobile

KUNA includes a Solana web3 layer using `@solana/web3.js`:

- Validates a Phantom/Solana public address.
- Links the address to the user profile in the app.
- Queries Devnet SOL balance.
- Opens the account in Solana Explorer.
- Uses a mobile-first UI designed for Saga/Seeker browser usage.

Code: [`src/services/solana.service.ts`](./src/services/solana.service.ts)  
UI: [`src/pages/Profile.tsx`](./src/pages/Profile.tsx)

Current demo address:

```txt
EVvym4WUUDjhiB6o81cT3CSoFHDLj1zLANPUe6cRcLc8
```

## Features

- Public landing page with problem, solution, and product story.
- JWT authentication with bcrypt password hashing.
- Dashboard with balance, KPIs, recent transactions, goals, and yield comparison charts.
- Deposit and withdraw flows backed by PostgreSQL.
- Savings goals with creation, progress tracking, and goal contributions.
- Transactions page with filters and totals.
- Kuna AI chat with OpenAI integration.
- Learning modules for financial education.
- Investment/yield explanation screen.
- Profile page with Solana Devnet wallet validation.
- Mobile-first UI deployed on Vercel.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion |
| State/Data | Zustand, Axios, React Router |
| Charts/UI | Recharts, Lucide Icons |
| Backend | Vercel Serverless Functions, Node.js |
| Database | Neon Postgres, Drizzle schema, SQL endpoints |
| Auth | JWT, bcrypt |
| AI | OpenAI API |
| Web3 | Solana Devnet, `@solana/web3.js`, Phantom public address |
| Deploy | Vercel |

## Architecture

```txt
User on mobile browser
        |
        v
React + Vite + Tailwind UI
        |
        v
Vercel Serverless API Routes
        |
        +--> Neon Postgres: users, wallets, goals, transactions
        +--> OpenAI API: Kuna AI advisor
        +--> Solana Devnet: address validation + balance lookup
```

## Project Structure

```txt
kuna-wallet/
  api/
    ai/chat.ts
    auth/login.ts
    auth/register.ts
    auth/me.ts
    wallet/balance.ts
    wallet/deposit.ts
    wallet/withdraw.ts
    goals/index.ts
    transactions/index.ts
    prices/usdc-pen.ts
  db/
    schema.ts
    seed.ts
    client.ts
  src/
    components/
    pages/
    services/
      api.ts
      solana.service.ts
    store/
    types/
    utils/
  submission-assets/
    kuna-logo.png
    kuna-banner.png
```

## Local Setup

### Requirements

- Node.js 18+
- Neon or Vercel Postgres database
- OpenAI API key
- Optional: Phantom wallet for Solana Devnet demo

### Environment variables

Create `.env.local`:

```txt
DATABASE_URL=postgresql://...
JWT_SECRET=your_long_random_secret
OPENAI_API_KEY=sk-...
```

### Install and run

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

For local API routes:

```bash
npx vercel dev
```

## Demo Flow

1. Open https://kuna-wallet.vercel.app
2. Log in with `maria@kuna.pe` / `demo1234`.
3. Review dashboard balance, goals, and transactions.
4. Deposit or withdraw a small demo amount.
5. Open `Kuna IA` and ask: "Como van mis ahorros?"
6. Go to `Perfil -> Wallet`.
7. Paste or connect a Phantom/Solana public address.
8. Validate the address and view Devnet SOL balance + Explorer link.

## Pitch Metrics

Example used in the demo narrative:

| Metric | KUNA | Traditional savings |
|---|---:|---:|
| Account opening | Email-first | Paperwork / branch |
| User education | Spanish AI advisor | Generic financial language |
| Savings visibility | Goals + progress | Static balance |
| Yield example | 6.5% APY simulated | 0.8% APY example |
| Microtransaction layer | Solana-ready | Bank fees |

Example:

If a family saves S/ 500 per month for one year:

- Traditional example: S/ 6,000 + S/ 24 = S/ 6,024
- KUNA demo model: S/ 6,000 + S/ 243 = S/ 6,243
- Difference: S/ 219 additional value in the example

Important: yields are presented as educational/demo estimates, not guaranteed returns.

## Submission Assets

Ready-to-upload assets are included:

```txt
submission-assets/kuna-logo.png
submission-assets/kuna-banner.png
```

Suggested screenshots:

1. Landing page.
2. Dashboard after login.
3. Profile -> Wallet showing a valid Solana address and Devnet SOL balance.

## References

- SBS Peru financial inclusion indicators: https://www.sbs.gob.pe/inclusion-financiera-principal/cifras-de-inclusion-financiera
- BCRP inflation reports: https://www.bcrp.gob.pe/en/inflation-report
- BCRP payments and fintech reports: https://www.bcrp.gob.pe/publicaciones/reporte-del-sistema-nacional-de-pagos.html

## Team

Built for Dev3pack Hackathon 2026 from Puno, Peru.

## License

MIT
