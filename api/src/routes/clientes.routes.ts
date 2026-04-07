import { Router } from "express";
import { getClientes, getCliente, createCliente, updateCliente, getHistorialCompras } from "../controllers/clientes.controller.js";

const router = Router();

router.get("/", getClientes);
router.get("/:id", getCliente);
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.get("/:id/compras", getHistorialCompras);

export default router;
