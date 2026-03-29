"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  CalendarDays,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Heart,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/familias", label: "Famílias", icon: Users },
  { href: "/atividades", label: "Atividades", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" id="sidebar-navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Heart size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-instituto">instituto</span>
          <span className="sidebar-logo-mondo"> mondó</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <Link href="/login" className="sidebar-nav-item sidebar-logout" id="nav-logout">
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </Link>

        {/* Branding */}
        <div className="sidebar-branding">
          <p className="sidebar-branding-text">Juntes por um futuro melhor!</p>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: #FEFBF7;
          border-right: 1px solid #E8D5C0;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 40;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          margin-bottom: 36px;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #C0272D, #D4444A);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FDF6ED;
          flex-shrink: 0;
        }

        .sidebar-logo-instituto {
          font-size: 14px;
          color: #C9943E;
          font-weight: 500;
        }

        .sidebar-logo-mondo {
          font-size: 14px;
          color: #491B02;
          font-weight: 800;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
          flex: 1;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 8px;
          color: #6B3A1F;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .sidebar-nav-item:hover {
          background: #F8E4CC40;
          color: #491B02;
        }

        .sidebar-nav-item-active {
          background: #F8E4CC;
          color: #491B02;
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 0 12px;
          margin-top: auto;
        }

        .sidebar-logout {
          color: #8B7355;
        }

        .sidebar-logout:hover {
          background: #C0272D10;
          color: #C0272D;
        }

        .sidebar-branding {
          margin-top: 16px;
          padding: 12px 16px;
          text-align: center;
        }

        .sidebar-branding-text {
          font-size: 12px;
          color: #C9943E;
          font-style: italic;
          font-weight: 500;
        }
      `}</style>
    </aside>
  );
}
