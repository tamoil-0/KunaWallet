import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
  "";

if (!connectionString) {
  console.error(
    "[db] DATABASE_URL not configured. Set it in Vercel env vars.",
  );
}

export const pool = new Pool({
  connectionString,
  ssl:
    !connectionString || connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle(pool, { schema });
export { schema };
