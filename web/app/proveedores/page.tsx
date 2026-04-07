"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";
import Modal from "@/components/Modal";

type Proveedor = { id: string; nombre: string; contacto: string; telefono: string; creado_en: string };

export default function ProveedoresPage() {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "" });
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const res = await api<Proveedor[]>("/api/proveedores");
    if (res.ok) setItems(res.data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api("/api/proveedores", { method: "POST", json: form });
    setLoading(false);
    setModalOpen(false);
    setForm({ nombre: "", contacto: "", telefono: "" });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar proveedor?")) return;
    await api(`/api/proveedores/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1>Red de Proveedores</h1>
          <p className="muted">Administra asociaciones y distribuidores</p>
        </div>
        <button className="btn" onClick={() => setModalOpen(true)}>
          + Nuevo Proveedor
        </button>
      </div>

      <Card>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empresa / Marca</th>
                <th>Nombre del Contacto</th>
                <th>Teléfono</th>
                <th>Fecha Ingreso</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: "center" }}>No hay proveedores registrados.</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.contacto || "—"}</td>
                    <td>{c.telefono || "—"}</td>
                    <td className="muted">{new Date(c.creado_en).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", gap: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => handleDelete(c.id)}>Desvincular</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Proveedor">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Empresa Proveedora *</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Distribuidora Global" />
          </div>
          <div className="form-group">
            <label>Persona de Contacto</label>
            <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Juan Pérez" />
          </div>
          <div className="form-group">
            <label>Teléfono de Contacto</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+12345678" />
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? "Guardando..." : "Guardar Relación"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
