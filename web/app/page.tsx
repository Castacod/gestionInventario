"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";

export default function Dashboard() {
  const [ventasDiarias, setVentasDiarias] = useState<any[]>([]);
  const [productosVendidos, setProductosVendidos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReportes() {
      const resVentas = await api<any[]>("/api/reportes/ventas-diarias");
      if (resVentas.ok) setVentasDiarias(resVentas.data || []);

      const resProd = await api<any[]>("/api/reportes/productos-mas-vendidos");
      if (resProd.ok) setProductosVendidos(resProd.data || []);
    }
    fetchReportes();
  }, []);

  return (
    <div>
      <h1>Dashboard Principal</h1>
      <p className="muted" style={{ marginBottom: "2rem" }}>
        Reportes y resumen general
      </p>

      <div className="grid-2">
        <Card title="Ventas Diarias">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operaciones</th>
                  <th>Ingreso Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasDiarias.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: "center" }}>No hay ventas registradas</td>
                  </tr>
                ) : (
                  ventasDiarias.map((v, i) => (
                    <tr key={i}>
                      <td>{new Date(v.fecha_venta).toLocaleDateString()}</td>
                      <td>{v.total_operaciones}</td>
                      <td style={{ color: "var(--success)", fontWeight: "bold" }}>${Number(v.monto_total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Productos Más Vendidos">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {productosVendidos.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="muted" style={{ textAlign: "center" }}>No hay datos suficientes</td>
                  </tr>
                ) : (
                  productosVendidos.map((p, i) => (
                    <tr key={i}>
                      <td>{p.nombre}</td>
                      <td><span className="badge success">{p.total_vendido} uds</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
