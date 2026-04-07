import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "InventarioX - Sistema Moderno",
  description: "Gestión de Inventario y Ventas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Sidebar />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
