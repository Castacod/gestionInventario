import { Router } from "express";
import { getVentasDiarias, getProductosMasVendidos } from "../controllers/reportes.controller.js";

const router = Router();

router.get("/ventas-diarias", getVentasDiarias);
router.get("/productos-mas-vendidos", getProductosMasVendidos);

export default router;
