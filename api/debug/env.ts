import { withErrorHandler } from "../_lib/handler";

export default withErrorHandler(async (_req, res) => {
  const keys = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
    "DATABASE_POSTGRES_URL",
    "DATABASE_POSTGRES_URL_NON_POOLING",
    "JWT_SECRET",
    "OPENAI_API_KEY",
  ];
  const status: Record<string, { set: boolean; preview?: string }> = {};
  for (const k of keys) {
    const v = process.env[k];
    status[k] = {
      set: !!v,
      preview: v
        ? v.length > 20
          ? v.slice(0, 12) + "..." + v.slice(-4)
          : "***"
        : undefined,
    };
  }
  return res.json({
    env: status,
    runtime: {
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      region: process.env.VERCEL_REGION || "unknown",
    },
  });
});
