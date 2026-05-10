export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    message: "KUNA API alive",
    time: new Date().toISOString(),
    runtime: "js",
    hasDbUrl:
      !!process.env.DATABASE_URL ||
      !!process.env.DATABASE_POSTGRES_URL_NON_POOLING,
    hasJwt: !!process.env.JWT_SECRET,
    hasOpenAi: !!process.env.OPENAI_API_KEY,
  });
}
