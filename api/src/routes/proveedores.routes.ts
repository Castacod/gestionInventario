import { Router } from "express";
import { getProveedores, getProveedor, createProveedor, updateProveedor, getProductosPorProveedor } from "../controllers/proveedores.controller.js";

const router = Router();

router.get("/", getProveedores);
router.get("/:id", getProveedor);
router.post("/", createProveedor);
router.put("/:id", updateProveedor);
router.get("/:id/productos", getProductosPorProveedor);

export default router;
