import { Request, Response } from "express";
import { query } from "../db/postgres.js";

export const getProveedores = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM proveedores ORDER BY creado_en DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query("SELECT * FROM proveedores WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  try {
    const { nombre, contacto, telefono } = req.body;
    const { rows } = await query(
      "INSERT INTO proveedores (nombre, contacto, telefono) VALUES ($1, $2, $3) RETURNING *",
      [nombre, contacto, telefono]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, telefono } = req.body;
    const { rows } = await query(
      "UPDATE proveedores SET nombre = $1, contacto = $2, telefono = $3 WHERE id = $4 RETURNING *",
      [nombre, contacto, telefono, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getProductosPorProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query("SELECT * FROM productos WHERE id_proveedor = $1", [id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
