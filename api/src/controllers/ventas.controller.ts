import { Request, Response } from "express";
import { query } from "../db/postgres.js";

export const getVentas = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM ventas ORDER BY fecha DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      "SELECT v.*, " +
      "(SELECT json_agg(json_build_object('id_producto', d.id_producto, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario, 'subtotal', d.subtotal)) " +
      " FROM detalles_venta d WHERE d.id_venta = v.id) as detalles " +
      "FROM ventas v WHERE v.id = $1", 
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const registrarVenta = async (req: Request, res: Response) => {
  try {
    const { id_cliente, items } = req.body;
    
    if (!id_cliente || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Datos inválidos para registrar venta" });
    }

    // Call stored procedure
    // En PostgreSQL (pg), las llamadas a un PROCEDURE se hacen con CALL, no con SELECT (a menos que sea FUNCTION)
    await query("CALL sp_registrar_venta($1, $2)", [id_cliente, JSON.stringify(items)]);

    res.status(201).json({ message: "Venta registrada exitosamente" });
  } catch (error) {
    // Los errores de stock (por el RAISE en el trigger) o de integridad se cachean acá y hacen el rollback implicito
    res.status(400).json({ error: (error as Error).message });
  }
};
