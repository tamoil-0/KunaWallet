import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
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

let realPool: Pool | null = null;
let realDb: NodePgDatabase<typeof schema> | null = null;

function createDb() {
  if (realDb) return realDb;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurado en Vercel");
  }

  realPool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  realDb = drizzle(realPool, { schema });
  return realDb;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const resolved = createDb();
    const value = (resolved as unknown as Record<PropertyKey, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(resolved);
    }
    return value;
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (prop === "end") {
      return async () => {
        if (realPool) await realPool.end();
      };
    }
    createDb();
    const value = (realPool as unknown as Record<PropertyKey, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(realPool);
    }
    return value;
  },
});
export { schema };
