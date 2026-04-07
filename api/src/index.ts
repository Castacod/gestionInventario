import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import productosRouter from "./routes/productos.routes.js";
import clientesRouter from "./routes/clientes.routes.js";
import proveedoresRouter from "./routes/proveedores.routes.js";
import ventasRouter from "./routes/ventas.routes.js";
import reportesRouter from "./routes/reportes.routes.js";
import authRouter from "./routes/auth.js";
import accountsRouter from "./routes/accounts.js";
import auditRouter from "./routes/audit.js";
import redisAdminRouter from "./routes/redis-admin.js";
import transactionsRouter from "./routes/transactions.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/redis", redisAdminRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/productos", productosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/ventas", ventasRouter);
app.use("/api/reportes", reportesRouter);

app.get("/", (_req, res) => {
  res.json({
    name: "academic-demo-api",
    docs: "/api/health",
    services: [
      "/api/auth",
      "/api/accounts",
      "/api/audit",
      "/api/redis",
      "/api/transactions",
      "/api/productos",
      "/api/clientes",
      "/api/proveedores",
      "/api/ventas",
      "/api/reportes",
    ],
  });
});

// Export app for testing
export { app };

if (import.meta.url.endsWith(process.argv[1])) {
  app.listen(port, () => {
    console.log(`API http://localhost:${port}`);
  });
}
