import { Request, Response } from "express";
import { query } from "../db/postgres.js";

export const getVentasDiarias = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM vw_ventas_diarias");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductosMasVendidos = async (_req: Request, res: Response) => {
  try {
    const { rows } = await query("SELECT * FROM vw_productos_mas_vendidos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
