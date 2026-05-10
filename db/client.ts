import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error(
      "DATABASE_URL not set. Add it in Vercel → Project → Settings → Environment Variables.",
    );
  }
  return url;
}

let _pool: Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (_db) return _db;
  const connectionString = getConnectionString();
  _pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  _db = drizzle(_pool, { schema });
  return _db;
}

export function getPool() {
  getDb();
  return _pool!;
}

// Backward compatible exports — accessed lazily on first property read
export const db = new Proxy(
  {},
  {
    get(_t, p) {
      const real = getDb() as unknown as Record<string, unknown>;
      const v = real[p as string];
      return typeof v === "function" ? (v as Function).bind(real) : v;
    },
  },
) as ReturnType<typeof drizzle>;

export const pool = new Proxy(
  {},
  {
    get(_t, p) {
      const real = getPool() as unknown as Record<string, unknown>;
      const v = real[p as string];
      return typeof v === "function" ? (v as Function).bind(real) : v;
    },
  },
) as Pool;

export { schema };
