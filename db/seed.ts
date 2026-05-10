import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import bcrypt from "bcryptjs";
import { db, pool } from "./client";
import {
  users,
  wallets,
  savingGoals,
  transactions,
  yieldPositions,
} from "./schema";

async function seed() {
  console.log("Limpiando datos previos...");
  await db.delete(transactions);
  await db.delete(yieldPositions);
  await db.delete(savingGoals);
  await db.delete(wallets);
  await db.delete(users);

  console.log("Hash demo password...");
  const hash = await bcrypt.hash("demo1234", 10);

  console.log("Insertando usuarios demo...");
  const [maria, carlos] = await db
    .insert(users)
    .values([
      {
        full_name: "María Quispe",
        email: "maria@kuna.pe",
        phone: "+51987654321",
        password_hash: hash,
        location: "Puno, Perú",
      },
      {
        full_name: "Carlos Mamani",
        email: "carlos@kuna.pe",
        phone: "+51912345678",
        password_hash: hash,
        location: "Juliaca, Puno",
      },
    ])
    .returning();

  console.log("Creando wallets...");
  const [walletMaria, walletCarlos] = await db
    .insert(wallets)
    .values([
      {
        user_id: maria.id,
        balance_pen: "850.00",
        balance_usdc: "225.456789",
        total_earned: "47.30",
        apy_current: "6.50",
        wallet_address: "5KuNa9pXqRzYbmDe1wQ8JhGtFvCsAdPxNeMjLkHy",
      },
      {
        user_id: carlos.id,
        balance_pen: "320.00",
        balance_usdc: "84.521000",
        total_earned: "12.80",
        apy_current: "6.50",
        wallet_address: "7CrLs4kBnPzQxRdYwTjMhVpFgEnSdAcUyWeKlXmH",
      },
    ])
    .returning();

  console.log("Creando metas de ahorro...");
  const goalsList = await db
    .insert(savingGoals)
    .values([
      {
        user_id: maria.id,
        title: "Universidad de mi hija",
        description: "Ana entra a la UNAP en marzo del 2026",
        target_amount: "15000.00",
        current_amount: "3420.00",
        target_date: "2026-03-01",
        category: "educacion",
        icon_emoji: "🎓",
        color: "#00D4FF",
        auto_save: true,
        auto_save_amount: "200.00",
      },
      {
        user_id: maria.id,
        title: "Capital para mi tienda",
        description: "Ampliar la bodega del barrio",
        target_amount: "5000.00",
        current_amount: "1800.00",
        target_date: "2025-12-01",
        category: "negocio",
        icon_emoji: "🏪",
        color: "#F5A623",
        auto_save: true,
        auto_save_amount: "150.00",
      },
      {
        user_id: carlos.id,
        title: "Laptop para estudiar",
        target_amount: "2500.00",
        current_amount: "950.00",
        target_date: "2025-09-01",
        category: "educacion",
        icon_emoji: "💻",
        color: "#00D4FF",
        auto_save: false,
      },
    ])
    .returning();

  console.log("Creando transacciones...");
  await db.insert(transactions).values([
    {
      user_id: maria.id,
      wallet_id: walletMaria.id,
      type: "deposit",
      amount_pen: "200.00",
      amount_usdc: "54.054054",
      exchange_rate: "3.7000",
      description: "Depósito mensual",
      status: "completed",
    },
    {
      user_id: maria.id,
      wallet_id: walletMaria.id,
      goal_id: goalsList[0].id,
      type: "goal_contribution",
      amount_pen: "200.00",
      amount_usdc: "54.054054",
      exchange_rate: "3.7000",
      description: "Aporte a Universidad de mi hija",
      status: "completed",
    },
    {
      user_id: maria.id,
      wallet_id: walletMaria.id,
      type: "yield",
      amount_pen: "1.89",
      amount_usdc: "0.510810",
      exchange_rate: "3.7000",
      description: "Rendimiento diario - Marinade Finance",
      status: "completed",
    },
    {
      user_id: maria.id,
      wallet_id: walletMaria.id,
      type: "yield",
      amount_pen: "1.85",
      description: "Rendimiento diario - Orca USDC Pool",
      status: "completed",
    },
    {
      user_id: maria.id,
      wallet_id: walletMaria.id,
      goal_id: goalsList[1].id,
      type: "goal_contribution",
      amount_pen: "150.00",
      amount_usdc: "40.540540",
      exchange_rate: "3.7000",
      description: "Aporte a Capital para mi tienda",
      status: "completed",
    },
    {
      user_id: carlos.id,
      wallet_id: walletCarlos.id,
      type: "deposit",
      amount_pen: "100.00",
      amount_usdc: "27.027027",
      exchange_rate: "3.7000",
      description: "Primer depósito",
      status: "completed",
    },
  ]);

  console.log("Creando posiciones de yield...");
  await db.insert(yieldPositions).values([
    {
      user_id: maria.id,
      pool_name: "Marinade Finance",
      amount_usdc: "112.728394",
      apy: "7.20",
      risk_level: "low",
    },
    {
      user_id: maria.id,
      pool_name: "Orca USDC/USDT",
      amount_usdc: "112.728395",
      apy: "5.80",
      risk_level: "low",
    },
    {
      user_id: carlos.id,
      pool_name: "Orca USDC/USDT",
      amount_usdc: "84.521000",
      apy: "5.80",
      risk_level: "low",
    },
  ]);

  console.log("✅ Seed completo. Demo: maria@kuna.pe / demo1234");
  await pool.end();
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
