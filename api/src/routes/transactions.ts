import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/postgres.js";
import { auditLogs } from "../db/mongo.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const transferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive(),
});

/**
 * Transacción ACID: transferencia entre dos cuentas del mismo usuario + movimiento en ledger.
 */
router.post("/transfer", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { fromAccountId, toAccountId, amount } = parsed.data;
  const userId = req.user!.userId;
  if (fromAccountId === toAccountId) {
    res.status(400).json({ error: "Cuentas deben ser distintas" });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const acc = await client.query<{ id: string }>(
      `SELECT id FROM accounts WHERE id IN ($1, $2) AND user_id = $3`,
      [fromAccountId, toAccountId, userId]
    );
    if (acc.rows.length !== 2) {
      await client.query("ROLLBACK");
      res.status(403).json({ error: "Cuentas no válidas para este usuario" });
      return;
    }
    const upd = await client.query(
      `UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING id`,
      [amount, fromAccountId]
    );
    if ((upd.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "Saldo insuficiente" });
      return;
    }
    await client.query(`UPDATE accounts SET balance = balance + $1 WHERE id = $2`, [
      amount,
      toAccountId,
    ]);
    await client.query(
      `INSERT INTO ledger_movements (from_account_id, to_account_id, amount) VALUES ($1, $2, $3)`,
      [fromAccountId, toAccountId, amount]
    );
    await client.query("COMMIT");

    try {
      const logs = await auditLogs();
      await logs.insertOne({
        action: "transfer",
        userId,
        detail: { fromAccountId, toAccountId, amount },
        createdAt: new Date(),
      });
    } catch (mongoErr) {
      console.warn("Mongo audit log failed:", mongoErr);
    }

    res.json({
      ok: true,
      message: "Transacción completada (COMMIT)",
      fromAccountId,
      toAccountId,
      amount,
    });
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    console.error(e);
    res.status(500).json({ error: "Error en transacción" });
  } finally {
    client.release();
  }
});

export default router;
