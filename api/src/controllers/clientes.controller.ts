import { Request, Response } from "express";
import { query } from "../db/postgres.js";

export const getClientes = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM clientes ORDER BY creado_en DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nombre, email, telefono } = req.body;
    const { rows } = await query(
      "INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING *",
      [nombre, email, telefono]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;
    const { rows } = await query(
      "UPDATE clientes SET nombre = $1, email = $2, telefono = $3 WHERE id = $4 RETURNING *",
      [nombre, email, telefono, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getHistorialCompras = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      "SELECT v.id, v.fecha, v.total, v.estado, " +
      "(SELECT json_agg(json_build_object('producto', p.nombre, 'cantidad', d.cantidad, 'subtotal', d.subtotal)) " +
      " FROM detalles_venta d JOIN productos p ON p.id = d.id_producto WHERE d.id_venta = v.id) as detalles " +
      "FROM ventas v WHERE v.id_cliente = $1 ORDER BY v.fecha DESC",
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
