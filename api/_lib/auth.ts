import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const JWT_SECRET = process.env.JWT_SECRET || "kuna-dev-secret-change-me";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: VercelRequest): JWTPayload | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return verifyToken(token);
}

export function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
): JWTPayload | null {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "No autorizado" });
    return null;
  }
  return user;
}
