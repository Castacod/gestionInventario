"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiTrendingUp, FiBox, FiUsers, FiTruck, FiBarChart2 } from "react-icons/fi";

const sections = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", path: "/", icon: FiHome },
      { name: "Ventas", path: "/ventas", icon: FiTrendingUp },
      { name: "Productos", path: "/productos", icon: FiBox },
    ],
  },
  {
    title: "Gestión",
    items: [
      { name: "Clientes", path: "/clientes", icon: FiUsers },
      { name: "Proveedores", path: "/proveedores", icon: FiTruck },
      { name: "Reportes", path: "/reportes", icon: FiBarChart2 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="brand-mark">IX</div>
          <div>
            <h2>InventarioX</h2>
            <p>Plataforma central de ventas y stock</p>
          </div>
        </div>

        <div className="sidebar-section">
          {sections.map((section) => (
            <div key={section.title} className="sidebar-group">
              <p className="sidebar-group-title">{section.title}</p>
              <div className="sidebar-nav">
                {section.items.map((route) => {
                  const isActive = pathname === route.path;
                  const Icon = route.icon;
                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                    >
                      <span className="sidebar-icon">
                        <Icon size={18} />
                      </span>
                      <span>{route.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">A</div>
        <div>
          <p className="profile-name">Admin Comercial</p>
          <p className="profile-role">Gestión de inventario</p>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          padding: 2rem 1.5rem;
          background: #050814;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2rem;
          z-index: 100;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .brand-mark {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #fff;
          font-weight: 800;
          font-size: 1rem;
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.18);
        }
        .sidebar-brand h2 {
          margin: 0;
          color: #fff;
          font-size: 1.4rem;
          letter-spacing: -0.04em;
        }
        .sidebar-brand p {
          margin: 0.35rem 0 0;
          color: var(--text-secondary);
          font-size: 0.94rem;
          line-height: 1.5;
        }
        .sidebar-group {
          margin-bottom: 1.75rem;
        }
        .sidebar-group-title {
          margin: 0 0 1rem;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.74rem;
          font-weight: 700;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .sidebar-link {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.95rem 1.1rem;
          border-radius: 16px;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.96rem;
          transition: var(--transition);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .sidebar-link.active {
          background: rgba(124, 58, 237, 0.18);
          color: #fff;
          border-color: rgba(124, 58, 237, 0.28);
        }
        .sidebar-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--accent-secondary);
          font-size: 0.95rem;
        }
        .sidebar-profile {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 1rem 1rem 1rem 1rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
          color: #fff;
          font-weight: 800;
        }
        .profile-name {
          margin: 0;
          font-weight: 700;
          color: #fff;
        }
        .profile-role {
          margin: 0.25rem 0 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </aside>
  );
}
