"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";
import Modal from "@/components/Modal";

type Producto = { id: string; nombre: string; descripcion: string; precio: string; stock: number; id_proveedor: string; creado_en: string };
type Proveedor = { id: string; nombre: string };

export default function ProductosPage() {
  const [items, setItems] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "0", id_proveedor: "" });
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const res = await api<Producto[]>("/api/productos");
    if (res.ok) setItems(res.data || []);
  }

  async function loadProveedores() {
    const res = await api<Proveedor[]>("/api/proveedores");
    if (res.ok) setProveedores(res.data || []);
  }

  useEffect(() => {
    loadData();
    loadProveedores();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api("/api/productos", { method: "POST", json: { ...form, precio: Number(form.precio), stock: Number(form.stock) } });
    setLoading(false);
    setModalOpen(false);
    setForm({ nombre: "", descripcion: "", precio: "", stock: "0", id_proveedor: "" });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    await api(`/api/productos/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1>Inventario de Productos</h1>
          <p className="muted">Control de existencias y precios</p>
        </div>
        <button className="btn" onClick={() => setModalOpen(true)}>
          + Nuevo Producto
        </button>
      </div>

      <Card>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock Disponible</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: "center" }}>No hay productos registrados.</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td className="muted">{c.descripcion || "—"}</td>
                    <td>${Number(c.precio).toFixed(2)}</td>
                    <td>
                      {c.stock > 10 ? (
                        <span className="badge success">{c.stock} en lote</span>
                      ) : c.stock > 0 ? (
                        <span className="badge warning">{c.stock} (Por agotarse)</span>
                      ) : (
                        <span className="badge danger">Agotado</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", gap: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => handleDelete(c.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ingresar Nuevo Producto">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Producto *</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Laptop Xenon X1" />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Características técnicas..." rows={3} />
          </div>
          <div className="row grid-2">
            <div className="form-group">
              <label>Precio Unitario ($) *</label>
              <input type="number" step="0.01" min="0" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock Inicial *</label>
              <input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Proveedor Asociado</label>
            <select value={form.id_proveedor} onChange={(e) => setForm({ ...form, id_proveedor: e.target.value })}>
              <option value="">— Sin proveedor —</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? "Guardando..." : "Registrar en Inventario"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
