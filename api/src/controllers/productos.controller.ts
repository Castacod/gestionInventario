import { Request, Response } from "express";
import { query } from "../db/postgres.js";

export const getProductos = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM productos ORDER BY creado_en DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query("SELECT * FROM productos WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const { id_proveedor, nombre, descripcion, precio, stock } = req.body;
    const { rows } = await query(
      "INSERT INTO productos (id_proveedor, nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id_proveedor || null, nombre, descripcion, precio, stock]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { id_proveedor, nombre, descripcion, precio, stock } = req.body;
    const { rows } = await query(
      "UPDATE productos SET id_proveedor = $1, nombre = $2, descripcion = $3, precio = $4, stock = $5 WHERE id = $6 RETURNING *",
      [id_proveedor || null, nombre, descripcion, precio, stock, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query("DELETE FROM productos WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
