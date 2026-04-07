import { Router } from "express";
import { auditLogs } from "../db/mongo.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const logs = await auditLogs();
  const items = await logs
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  res.json({
    items: items.map((d) => ({
      action: d.action,
      detail: d.detail,
      createdAt: d.createdAt,
    })),
  });
});

export default router;
