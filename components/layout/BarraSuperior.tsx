"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usuarioAtual } from "@/models/estado";
import { Bell, Search } from "lucide-react";
import styles from "./BarraSuperior.module.css";

const itensMenuSuperior = [
  { href: "/", label: "Início" },
  { href: "/familias", label: "Famílias" },
  { href: "/atividades", label: "Atividades" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function BarraSuperior() {
  const pathname = usePathname();

  return (
    <header className={styles.topbar} id="topbar-header">
      {/* Spacer for sidebar */}
      <div className={styles["topbar-spacer"]} />

      {/* Logo text (mobile fallback) */}
      <div className={styles["topbar-brand"]}>
        <span className={styles["topbar-brand-instituto"]}>instituto</span>
        <span className={styles["topbar-brand-mondo"]}> mondó</span>
      </div>

      {/* Center navigation */}
      <nav className={styles["topbar-nav"]}>
        {itensMenuSuperior.map((item) => {
          const ativo =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["topbar-nav-link"]} ${ativo ? styles["topbar-nav-link-active"] : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className={styles["topbar-right"]}>
        <button className={styles["topbar-icon-btn"]} aria-label="Buscar" id="btn-search">
          <Search size={18} />
        </button>
        <button className={styles["topbar-icon-btn"]} aria-label="Notificações" id="btn-notifications">
          <Bell size={18} />
          <span className={styles["topbar-notification-dot"]} />
        </button>
        <div className={styles["topbar-user"]} id="user-greeting">
          <span className={styles["topbar-user-greeting"]}>Olá, {usuarioAtual.nome}</span>
          <div className={styles["topbar-user-avatar"]}>
            {usuarioAtual.nome.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

