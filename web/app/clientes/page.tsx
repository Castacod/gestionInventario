"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";
import Modal from "@/components/Modal";

type Cliente = { id: string; nombre: string; email: string; telefono: string; creado_en: string };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(false);

  async function loadClientes() {
    const res = await api<Cliente[]>("/api/clientes");
    if (res.ok) setClientes(res.data || []);
  }

  useEffect(() => {
    loadClientes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api("/api/clientes", { method: "POST", json: form });
    setLoading(false);
    setModalOpen(false);
    setForm({ nombre: "", email: "", telefono: "" });
    loadClientes();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar cliente?")) return;
    await api(`/api/clientes/${id}`, { method: "DELETE" });
    loadClientes();
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1>Directorio de Clientes</h1>
          <p className="muted">Administra tu cartera de clientes</p>
        </div>
        <button className="btn" onClick={() => setModalOpen(true)}>
          + Nuevo Cliente
        </button>
      </div>

      <Card>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
                <th>Fecha Ingreso</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: "center" }}>No hay clientes registrados.</td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.telefono || "—"}</td>
                    <td className="muted">{new Date(c.creado_en).toLocaleDateString()}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Cliente">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo *</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Empresa SA" />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contacto@empresa.com" />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+12345678" />
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? "Guardando..." : "Guardar Cliente"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
