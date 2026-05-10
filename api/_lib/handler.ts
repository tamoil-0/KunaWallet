import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./cors";

export type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => Promise<unknown> | unknown;

export function withErrorHandler(handler: ApiHandler) {
  return async function wrapped(req: VercelRequest, res: VercelResponse) {
    if (setCors(req, res)) return;
    try {
      return await handler(req, res);
    } catch (err) {
      console.error("[api error]", err);
      if (res.headersSent) return;
      const message =
        err instanceof Error ? err.message : "Error inesperado en el servidor";
      return res.status(500).json({ error: message });
    }
  };
}
