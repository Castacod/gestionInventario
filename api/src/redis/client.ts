import { Redis } from "ioredis";

type RedisClient = InstanceType<typeof Redis>;

let redis: RedisClient | null = null;

/**
 * Cliente Redis: sesiones de auth (session:{id}) y utilidades de demo.
 */
export function getRedis(): RedisClient {
  if (!redis) {
    const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
}

const SESSION_PREFIX = "session:";
const SESSION_TTL_SEC = 60 * 60 * 24; // 24h

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function saveSession(sessionId: string, payload: SessionPayload): Promise<void> {
  const r = getRedis();
  await r.set(
    `${SESSION_PREFIX}${sessionId}`,
    JSON.stringify(payload),
    "EX",
    SESSION_TTL_SEC
  );
}

/** Consulta Redis usada en autenticación: validar sesión existente. */
export async function getSession(sessionId: string): Promise<SessionPayload | null> {
  const r = getRedis();
  const raw = await r.get(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await getRedis().del(`${SESSION_PREFIX}${sessionId}`);
}
