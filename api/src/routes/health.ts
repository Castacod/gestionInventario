import { Router } from "express";
import { getPool } from "../db/postgres.js";
import { getMongoDb } from "../db/mongo.js";
import { getRedis } from "../redis/client.js";

const router = Router();

router.get("/", async (_req, res) => {
  const status: Record<string, string> = {
    api: "ok",
    postgres: "unknown",
    mongo: "unknown",
    redis: "unknown",
  };
  try {
    await getPool().query("SELECT 1");
    status.postgres = "ok";
  } catch (e) {
    status.postgres = "error";
    console.error("health postgres", e);
  }
  try {
    await getMongoDb();
    status.mongo = "ok";
  } catch (e) {
    status.mongo = "error";
    console.error("health mongo", e);
  }
  try {
    await getRedis().ping();
    status.redis = "ok";
  } catch (e) {
    status.redis = "error";
    console.error("health redis", e);
  }
  const ok =
    status.postgres === "ok" && status.mongo === "ok" && status.redis === "ok";
  res.status(ok ? 200 : 503).json({ status });
});

export default router;
