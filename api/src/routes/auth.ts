import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { query } from "../db/postgres.js";
import { auditLogs } from "../db/mongo.js";
import { saveSession, deleteSession } from "../redis/client.js";
import { signSessionToken, requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const userResult = await query<{ id: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      [email.toLowerCase(), hash]
    );
    const userId = userResult.rows[0].id;
    await query(
      `INSERT INTO accounts (user_id, balance, label) VALUES ($1, $2, $3)`,
      [userId, "1000.00", "primary"]
    );
    try {
      const logs = await auditLogs();
      await logs.insertOne({
        action: "user_registered",
        userId,
        detail: { email },
        createdAt: new Date(),
      });
    } catch (mongoErr) {
      console.warn("Mongo audit log failed:", mongoErr);
    }
    res.status(201).json({ message: "Usuario creado", userId });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      res.status(409).json({ error: "Email ya registrado" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Error al registrar" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const r = await query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  if (r.rows.length === 0) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }
  const row = r.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }
  const sessionId = uuidv4();
  await saveSession(sessionId, { userId: row.id, email: email.toLowerCase() });
  const token = signSessionToken(sessionId);
  try {
    const logs = await auditLogs();
    await logs.insertOne({
      action: "login",
      userId: row.id,
      detail: { email },
      createdAt: new Date(),
    });
  } catch (mongoErr) {
    console.warn("Mongo audit log failed:", mongoErr);
  }
  res.json({
    token,
    sessionId,
    message: "Sesión almacenada en Redis (clave session:{id}); token JWT referencia la sesión.",
  });
});

router.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
  await deleteSession(req.user!.sessionId);
  res.json({ message: "Sesión eliminada de Redis" });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: { id: req.user!.userId, email: req.user!.email } });
});

export default router;
