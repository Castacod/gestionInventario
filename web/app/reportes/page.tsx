"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";

type VentaDiaria = { fecha_venta: string; total_operaciones: number; monto_total: string };
type ProductoVendido = { id: string; nombre: string; total_vendido: number };

export default function ReportesPage() {
  const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([]);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [ventasRes, productosRes] = await Promise.all([
        api<VentaDiaria[]>("/api/reportes/ventas-diarias"),
        api<ProductoVendido[]>("/api/reportes/productos-mas-vendidos"),
      ]);
      if (ventasRes.ok) setVentasDiarias(ventasRes.data || []);
      if (productosRes.ok) setProductosVendidos(productosRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const ingresosTotales = ventasDiarias.reduce((sum, item) => sum + Number(item.monto_total || 0), 0);
  const volumenOperaciones = ventasDiarias.reduce((sum, item) => sum + Number(item.total_operaciones || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Reportes</h1>
        <p className="muted">Información clave para decisiones de ventas y stock.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <Card title="Ingresos Totales" description="Suma agregada de ventas completadas.">
          <p className="dashboard-value">${ingresosTotales.toFixed(2)}</p>
          <p className="muted">Total de operaciones: {volumenOperaciones}</p>
        </Card>
        <Card title="Productos más vendidos" description="Top productos que mueven el inventario.">
          <p className="dashboard-value">{productosVendidos[0]?.nombre ?? "Ninguno"}</p>
          <p className="muted">Unidades vendidas: {productosVendidos[0]?.total_vendido ?? 0}</p>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Ventas Diarias">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operaciones</th>
                  <th>Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: "center" }}>Cargando reportes...</td>
                  </tr>
                ) : ventasDiarias.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: "center" }}>No hay ventas registradas.</td>
                  </tr>
                ) : (
                  ventasDiarias.map((item) => (
                    <tr key={item.fecha_venta}>
                      <td>{new Date(item.fecha_venta).toLocaleDateString()}</td>
                      <td>{item.total_operaciones}</td>
                      <td style={{ color: "var(--success)", fontWeight: "bold" }}>${Number(item.monto_total).toFixed(2)}</td>
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
                {loading ? (
                  <tr>
                    <td colSpan={2} className="muted" style={{ textAlign: "center" }}>Cargando productos...</td>
                  </tr>
                ) : productosVendidos.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="muted" style={{ textAlign: "center" }}>No hay datos suficientes.</td>
                  </tr>
                ) : (
                  productosVendidos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td><span className="badge success">{item.total_vendido} uds</span></td>
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
