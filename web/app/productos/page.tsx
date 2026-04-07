"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  id_proveedor: string;
  creado_en: string;
};
type Proveedor = { id: string; nombre: string };

export default function ProductosPage() {
  const [items, setItems] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "0",
    id_proveedor: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    await api("/api/productos", {
      method: "POST",
      json: { ...form, precio: Number(form.precio), stock: Number(form.stock) },
    });
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

  const filteredItems = items.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", text: "Agotado" };
    if (stock < 10) return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", text: `${stock} (Bajo)` };
    return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", text: `${stock} en stock` };
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <Package size={32} />
            Inventario de Productos
          </h1>
          <p className="text-gray-400 mt-2">Control de existencias y precios</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all duration-300"
        >
          <Plus size={20} />
          Nuevo Producto
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
      >
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 font-semibold text-gray-300">Producto</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-300">Descripción</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-300">Precio</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-300">Stock</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const stockStatus = getStockStatus(item.stock);
                  const StatusIcon = stockStatus.icon;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{item.nombre}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 max-w-xs truncate">
                        {item.descripcion || "—"}
                      </td>
                      <td className="py-4 px-4 font-medium text-green-400">
                        ${Number(item.precio).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          <StatusIcon size={16} />
                          {stockStatus.text}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={24} />
              Nuevo Producto
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Laptop Xenon X1"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Características técnicas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio Unitario ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proveedor Asociado
                </label>
                <select
                  value={form.id_proveedor}
                  onChange={(e) => setForm({ ...form, id_proveedor: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">— Sin proveedor —</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Registrar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
