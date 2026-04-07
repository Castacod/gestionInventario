"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  Users,
  Truck,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { api } from "@/lib/api";

type Stats = {
  totalVentas: number;
  totalProductos: number;
  totalClientes: number;
  totalProveedores: number;
  ventasMes: number;
  productosBajoStock: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Simular carga de estadísticas - en un sistema real, tendrías endpoints específicos
      const [productosRes, clientesRes, proveedoresRes, ventasRes] = await Promise.all([
        api<any[]>('/api/productos'),
        api<any[]>('/api/clientes'),
        api<any[]>('/api/proveedores'),
        api<any[]>('/api/ventas'),
      ]);

      const productos = productosRes.ok ? productosRes.data || [] : [];
      const clientes = clientesRes.ok ? clientesRes.data || [] : [];
      const proveedores = proveedoresRes.ok ? proveedoresRes.data || [] : [];
      const ventas = ventasRes.ok ? ventasRes.data || [] : [];

      const totalVentas = ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
      const productosBajoStock = productos.filter((p: any) => p.stock < 10).length;

      setStats({
        totalVentas,
        totalProductos: productos.length,
        totalClientes: clientes.length,
        totalProveedores: proveedores.length,
        ventasMes: totalVentas, // Simplificado
        productosBajoStock,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const cards = [
    {
      title: "Ventas Totales",
      value: `$${stats?.totalVentas.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Productos en Inventario",
      value: stats?.totalProductos || 0,
      icon: Package,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Clientes Registrados",
      value: stats?.totalClientes || 0,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Proveedores",
      value: stats?.totalProveedores || 0,
      icon: Truck,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Ventas del Mes",
      value: `$${stats?.ventasMes.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Productos Bajo Stock",
      value: stats?.productosBajoStock || 0,
      icon: ShoppingCart,
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Dashboard de Gestión
        </h1>
        <p className="text-gray-400 text-lg">
          Bienvenido al Sistema de Gestión de Ventas e Inventario
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl shadow-lg border border-gray-700 ${card.bgColor} hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Resumen Ejecutivo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Estado del Inventario</h3>
            <p className="text-gray-300">
              Mantén un control óptimo de tu inventario. Actualmente tienes{" "}
              <span className="font-semibold text-white">{stats?.totalProductos || 0}</span> productos
              registrados, con <span className="font-semibold text-red-400">
                {stats?.productosBajoStock || 0}
              </span> productos que requieren atención por bajo stock.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Rendimiento de Ventas</h3>
            <p className="text-gray-300">
              Tus ventas totales ascienden a{" "}
              <span className="font-semibold text-white">${stats?.totalVentas.toFixed(2) || "0.00"}</span>.
              Continúa expandiendo tu base de clientes que actualmente cuenta con{" "}
              <span className="font-semibold text-white">{stats?.totalClientes || 0}</span> registros.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
