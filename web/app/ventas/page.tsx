"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";

type Producto = { id: string; nombre: string; precio: string; stock: number };
type Cliente = { id: string; nombre: string };
type CartItem = { producto: Producto; cantidad: number };

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);

  // Carrito State
  const [selectedCliente, setSelectedCliente] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  async function loadData() {
    const resProd = await api<Producto[]>("/api/productos");
    if (resProd.ok) setProductos(resProd.data?.filter(p => p.stock > 0) || []);

    const resCli = await api<Cliente[]>("/api/clientes");
    if (resCli.ok) setClientes(resCli.data || []);

    const resVen = await api<any[]>("/api/ventas");
    if (resVen.ok) setVentas(resVen.data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function addProductToCart(p: Producto) {
    setCart((prev) => {
      const exists = prev.find(item => item.producto.id === p.id);
      if (exists) {
        if (exists.cantidad >= p.stock) return prev;
        return prev.map(item => item.producto.id === p.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { producto: p, cantidad: 1 }];
    });
  }

  function removeProduct(id: string) {
    setCart((prev) => prev.filter(item => item.producto.id !== id));
  }

  async function handleCheckout() {
    if (!selectedCliente) return setMsg({ type: "error", text: "Seleccione un cliente" });
    if (cart.length === 0) return setMsg({ type: "error", text: "El carrito está vacío" });

    setLoading(true);
    const items = cart.map(i => ({
      id_producto: i.producto.id,
      cantidad: i.cantidad,
      precio_unitario: Number(i.producto.precio)
    }));

    const res = await api("/api/ventas", {
      method: "POST",
      json: { id_cliente: selectedCliente, items }
    });

    setLoading(false);
    if (res.ok) {
      setMsg({ type: "success", text: "Venta registrada exitosamente." });
      setCart([]);
      setSelectedCliente("");
      loadData();
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ type: "error", text: "Error: No se pudo procesar la venta." });
    }
  }

  const granTotal = cart.reduce((acc, curr) => acc + (Number(curr.producto.precio) * curr.cantidad), 0);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Punto de Venta</h1>
        <p className="muted">Emisión de tickets rápidos</p>
      </div>

      <div className="grid-2">
        <Card title="Terminal de Venta">
          {msg && (
            <div className={`badge ${msg.type === "error" ? 'danger' : 'success'}`} style={{ display: 'block', padding: '1rem', marginBottom: '1rem' }}>
              {msg.text}
            </div>
          )}

          <div className="form-group">
            <label>Cliente</label>
            <select value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
              <option value="">— Seleccionar cliente —</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {productos.map(p => (
              <button key={p.id} type="button" className="btn secondary" style={{ padding: "0.5rem", fontSize: "0.85rem" }} onClick={() => addProductToCart(p)}>
                {p.nombre} - ${p.precio}
              </button>
            ))}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "1rem" }}>
            <h3>Carrito Actual</h3>
            {cart.length === 0 ? <p className="muted">Vacío</p> : (
              <ul style={{ listStyle: "none", margin: "1rem 0", padding: 0 }}>
                {cart.map(i => (
                  <li key={i.producto.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>{i.cantidad}x {i.producto.nombre}</span>
                    <span style={{ display: 'flex', gap: '1rem' }}>
                      ${(Number(i.producto.precio) * i.cantidad).toFixed(2)}
                      <button className="btn danger" style={{ padding: '0.1rem 0.4rem', border: 'none', background: 'transparent' }} onClick={() => removeProduct(i.producto.id)}>&times;</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex-between" style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <h2>Total:</h2>
              <h2 style={{ color: "var(--success)" }}>${granTotal.toFixed(2)}</h2>
            </div>
            <button className="btn" style={{ width: "100%", marginTop: "1rem" }} onClick={handleCheckout} disabled={loading || cart.length === 0}>
              {loading ? "Procesando..." : "Confirmar e Imprimir Venta"}
            </button>
          </div>
        </Card>

        <Card title="Últimas Ventas (Historial)">
          <div className="table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted" style={{ textAlign: "center" }}>Sin ventas recientes</td>
                  </tr>
                ) : (
                  ventas.slice(0, 10).map((v) => (
                    <tr key={v.id}>
                      <td className="muted" title={v.id}>{v.id.split("-")[0]}</td>
                      <td>{new Date(v.fecha).toLocaleString()}</td>
                      <td><b>${Number(v.total).toFixed(2)}</b></td>
                      <td><span className="badge success">{v.estado}</span></td>
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
