import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getSession } from "../redis/client.js";

export type AuthedRequest = Request & {
  user?: { userId: string; email: string; sessionId: string };
};

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is required");
  return s;
}

export function signSessionToken(sessionId: string): string {
  return jwt.sign({ sid: sessionId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): { sid: string } | null {
  try {
    const p = jwt.verify(token, getJwtSecret()) as { sid?: string };
    if (!p.sid || typeof p.sid !== "string") return null;
    return { sid: p.sid };
  } catch {
    return null;
  }
}

/**
 * Middleware: valida JWT y luego consulta Redis (GET session:{id}) para autenticación.
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const decoded = verifySessionToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const session = await getSession(decoded.sid);
  if (!session) {
    res.status(401).json({ error: "Session not found in Redis" });
    return;
  }
  req.user = {
    userId: session.userId,
    email: session.email,
    sessionId: decoded.sid,
  };
  next();
}
