import { Router } from "express";
import { z } from "zod";
import { getRedis } from "../redis/client.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const setSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().max(4000),
  ttlSeconds: z.number().int().positive().max(86400).optional(),
});

/** Crear par clave-valor en Redis (demo). */
router.post("/set", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = setSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { key, value, ttlSeconds } = parsed.data;
  const namespaced = `demo:${req.user!.userId}:${key}`;
  const r = getRedis();
  if (ttlSeconds) {
    await r.set(namespaced, value, "EX", ttlSeconds);
  } else {
    await r.set(namespaced, value);
  }
  res.json({ ok: true, redisKey: namespaced, message: "SET ejecutado" });
});

router.get("/get", requireAuth, async (req: AuthedRequest, res) => {
  const key = typeof req.query.key === "string" ? req.query.key : "";
  if (!key) {
    res.status(400).json({ error: "Query key requerida" });
    return;
  }
  const namespaced = `demo:${req.user!.userId}:${key}`;
  const val = await getRedis().get(namespaced);
  res.json({ key: namespaced, value: val });
});

/** FLUSHALL solo si ALLOW_REDIS_FLUSH=true (desarrollo). */
router.post("/flushall", requireAuth, async (req: AuthedRequest, res) => {
  if (process.env.ALLOW_REDIS_FLUSH !== "true") {
    res.status(403).json({
      error: "Flush deshabilitado. Establece ALLOW_REDIS_FLUSH=true solo en desarrollo.",
    });
    return;
  }
  const r = getRedis();
  await r.flushall();
  res.json({
    ok: true,
    message: "FLUSHALL ejecutado en esta instancia Redis",
    warning: "Todas las claves (incl. sesiones) fueron borradas. Debes iniciar sesión de nuevo.",
  });
});

router.get("/keys", requireAuth, async (req: AuthedRequest, res) => {
  const r = getRedis();
  const pattern = `demo:${req.user!.userId}:*`;
  const keys = await r.keys(pattern);
  res.json({ keys });
});

export default router;
