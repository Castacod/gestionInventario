import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Sistema de Gestión de Ventas e Inventario",
  description: "Plataforma profesional para gestión empresarial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-950 text-white">
        <Sidebar />
        <main className="main-content">
          <div className="page-shell">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
