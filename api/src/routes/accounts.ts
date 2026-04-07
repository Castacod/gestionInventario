import { Router } from "express";
import { z } from "zod";
import { query } from "../db/postgres.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const r = await query<{
    id: string;
    balance: string;
    label: string | null;
  }>(
    `SELECT id, balance::text, label FROM accounts WHERE user_id = $1 ORDER BY label`,
    [userId]
  );
  res.json({ accounts: r.rows });
});

const createSchema = z.object({
  label: z.string().min(1).max(80).optional(),
});

/** Creación de nuevo registro (cuenta) en PostgreSQL. */
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user!.userId;
  const label = parsed.data.label ?? "extra";
  const r = await query<{ id: string }>(
    `INSERT INTO accounts (user_id, balance, label) VALUES ($1, 0, $2) RETURNING id`,
    [userId, label]
  );
  res.status(201).json({ accountId: r.rows[0].id, message: "Cuenta creada" });
});

export default router;
