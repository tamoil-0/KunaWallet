import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  text,
  boolean,
  integer,
  jsonb,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  avatar_url: varchar("avatar_url", { length: 500 }),
  location: varchar("location", { length: 100 }).default("Puno, Perú"),
  language: varchar("language", { length: 10 }).default("es"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  balance_pen: decimal("balance_pen", { precision: 15, scale: 2 }).default("0.00"),
  balance_usdc: decimal("balance_usdc", { precision: 15, scale: 6 }).default("0.000000"),
  total_earned: decimal("total_earned", { precision: 15, scale: 2 }).default("0.00"),
  apy_current: decimal("apy_current", { precision: 5, scale: 2 }).default("6.50"),
  wallet_address: varchar("wallet_address", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const savingGoals = pgTable("saving_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  target_amount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  current_amount: decimal("current_amount", { precision: 15, scale: 2 }).default("0.00"),
  target_date: date("target_date"),
  currency: varchar("currency", { length: 5 }).default("PEN"),
  category: varchar("category", { length: 50 }),
  icon_emoji: varchar("icon_emoji", { length: 10 }).default("🎯"),
  color: varchar("color", { length: 20 }).default("#F5A623"),
  status: varchar("status", { length: 20 }).default("active"),
  auto_save: boolean("auto_save").default(false),
  auto_save_amount: decimal("auto_save_amount", { precision: 15, scale: 2 }).default("0"),
  auto_save_frequency: varchar("auto_save_frequency", { length: 20 }).default("monthly"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  wallet_id: uuid("wallet_id").references(() => wallets.id),
  goal_id: uuid("goal_id").references(() => savingGoals.id),
  type: varchar("type", { length: 30 }).notNull(),
  amount_pen: decimal("amount_pen", { precision: 15, scale: 2 }).notNull(),
  amount_usdc: decimal("amount_usdc", { precision: 15, scale: 6 }),
  exchange_rate: decimal("exchange_rate", { precision: 10, scale: 4 }),
  description: varchar("description", { length: 500 }),
  status: varchar("status", { length: 20 }).default("completed"),
  tx_hash: varchar("tx_hash", { length: 100 }),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  created_at: timestamp("created_at").defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  tokens_used: integer("tokens_used").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const learnProgress = pgTable(
  "learn_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    module_id: varchar("module_id", { length: 50 }).notNull(),
    completed: boolean("completed").default(false),
    score: integer("score").default(0),
    completed_at: timestamp("completed_at"),
  },
  (t) => ({
    uq: unique().on(t.user_id, t.module_id),
  }),
);

export const yieldPositions = pgTable("yield_positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  pool_name: varchar("pool_name", { length: 100 }).notNull(),
  amount_usdc: decimal("amount_usdc", { precision: 15, scale: 6 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  risk_level: varchar("risk_level", { length: 20 }).default("low"),
  started_at: timestamp("started_at").defaultNow(),
  last_yield_at: timestamp("last_yield_at").defaultNow(),
});

export type DbUser = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DbWallet = typeof wallets.$inferSelect;
export type DbGoal = typeof savingGoals.$inferSelect;
export type DbTransaction = typeof transactions.$inferSelect;
