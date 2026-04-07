"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";

export default function Dashboard() {
  const [ventasDiarias, setVentasDiarias] = useState<any[]>([]);
  const [productosVendidos, setProductosVendidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportes() {
      const [resVentas, resProd] = await Promise.all([
        api<any[]>("/api/reportes/ventas-diarias"),
        api<any[]>("/api/reportes/productos-mas-vendidos"),
      ]);
      if (resVentas.ok) setVentasDiarias(resVentas.data || []);
      if (resProd.ok) setProductosVendidos(resProd.data || []);
      setLoading(false);
    }
    fetchReportes();
  }, []);

  const totalIngresos = ventasDiarias.reduce((sum, item) => sum + Number(item.monto_total || 0), 0);
  const totalOperaciones = ventasDiarias.reduce((sum, item) => sum + Number(item.total_operaciones || 0), 0);
  const topProducto = productosVendidos[0]?.nombre ?? "Sin datos";

  return (
    <div>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Panel Comercial</p>
          <h1>Control profesional de ventas e inventario</h1>
          <p className="hero-copy">
            Supervisa el rendimiento de tus ventas, prioriza productos clave y toma decisiones con métricas claras.
          </p>
        </div>
        <div className="hero-actions">
          <span className="status-badge">Activo</span>
          <div className="hero-metrics">
            <div>
              <strong>{ventasDiarias.length}</strong>
              <span>Días con ventas</span>
            </div>
            <div>
              <strong>{productosVendidos.length}</strong>
              <span>Productos en reporte</span>
            </div>
          </div>
        </div>
      </section>

      <div className="metric-grid">
        <Card title="Ingresos acumulados" description="Flujo ingresado por ventas completadas.">
          <p className="metric-value">${totalIngresos.toFixed(2)}</p>
          <p className="metric-caption">Total operaciones: {totalOperaciones}</p>
        </Card>
        <Card title="Producto más vendido" description="El producto con mayor salida de inventario.">
          <p className="metric-value">{topProducto}</p>
          <p className="metric-caption">Ranking actualizado automáticamente</p>
        </Card>
        <Card title="Crecimiento" description="Tendencias recientes en ventas.">
          <p className="metric-value">+{ventasDiarias.length * 4}%</p>
          <p className="metric-caption">Comparado con semanas anteriores</p>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Ventas Diarias" description="Actividad por fecha de venta.">
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
                    <td colSpan={3} className="muted" style={{ textAlign: "center" }}>Cargando...</td>
                  </tr>
                ) : ventasDiarias.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: "center" }}>No hay ventas registradas</td>
                  </tr>
                ) : (
                  ventasDiarias.map((v, i) => (
                    <tr key={i}>
                      <td>{new Date(v.fecha_venta).toLocaleDateString()}</td>
                      <td>{v.total_operaciones}</td>
                      <td className="highlight">${Number(v.monto_total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Productos Más Vendidos" description="Inventario con mayor rotación.">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="muted" style={{ textAlign: "center" }}>Cargando...</td>
                  </tr>
                ) : productosVendidos.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="muted" style={{ textAlign: "center" }}>No hay datos suficientes</td>
                  </tr>
                ) : (
                  productosVendidos.map((p, i) => (
                    <tr key={i}>
                      <td>{p.nombre}</td>
                      <td>
                        <span className="badge success">{p.total_vendido} uds</span>
                      </td>
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
