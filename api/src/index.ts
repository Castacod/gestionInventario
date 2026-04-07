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
app.use("/api/productos", productosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/ventas", ventasRouter);
app.use("/api/reportes", reportesRouter);

app.get("/", (_req, res) => {
  res.json({ name: "academic-demo-api", docs: "/api/health" });
});

app.listen(port, () => {
  console.log(`API http://localhost:${port}`);
});
