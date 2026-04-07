import { Router } from "express";
import { getVentas, getVenta, registrarVenta } from "../controllers/ventas.controller.js";

const router = Router();

router.get("/", getVentas);
router.get("/:id", getVenta);
router.post("/", registrarVenta);

export default router;
