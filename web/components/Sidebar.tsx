"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { name: "Dashboard", path: "/" },
    { name: "Ventas", path: "/ventas" },
    { name: "Productos", path: "/productos" },
    { name: "Clientes", path: "/clientes" },
    { name: "Proveedores", path: "/proveedores" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>InventarioX</h2>
      </div>
      <nav className="sidebar-nav">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              {route.name}
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar-brand {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .sidebar-brand h2 {
          margin: 0;
          color: var(--accent-primary);
          font-weight: 800;
          letter-spacing: -0.05em;
          text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        .sidebar-nav {
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-link {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border-left: 3px solid var(--accent-primary);
        }
      `}</style>
    </aside>
  );
}
