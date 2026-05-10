export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  location: string;
  language: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance_pen: number;
  balance_usdc: number;
  total_earned: number;
  apy_current: number;
  wallet_address: string | null;
  created_at: string;
}

export type GoalCategory =
  | "educacion"
  | "salud"
  | "negocio"
  | "vivienda"
  | "viaje"
  | "otro";

export type GoalStatus = "active" | "completed" | "paused";

export interface SavingGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  currency: string;
  category: GoalCategory;
  icon_emoji: string;
  color: string;
  status: GoalStatus;
  auto_save: boolean;
  auto_save_amount: number;
  auto_save_frequency: "daily" | "weekly" | "monthly";
  created_at: string;
  completed_at?: string | null;
}

export type TransactionType =
  | "deposit"
  | "withdraw"
  | "yield"
  | "convert"
  | "goal_contribution";

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  goal_id?: string | null;
  type: TransactionType;
  amount_pen: number;
  amount_usdc?: number;
  exchange_rate?: number;
  description: string;
  status: "pending" | "completed" | "failed";
  tx_hash?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface YieldPosition {
  id: string;
  user_id: string;
  pool_name: string;
  amount_usdc: number;
  apy: number;
  risk_level: "low" | "medium" | "high";
  started_at: string;
  last_yield_at: string;
}

export interface AuthResponse {
  user: User;
  wallet: Wallet;
  token: string;
}

export interface PriceData {
  usdc_to_pen: number;
  pen_to_usdc: number;
  updated_at: string;
}
