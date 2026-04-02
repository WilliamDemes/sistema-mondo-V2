"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  CalendarDays,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Heart,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/familias", label: "Famílias", icon: Users },
  { href: "/atividades", label: "Atividades", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Inicialkizando o router

  // 2. A função que chama o segurança para destruir o crachá
  const handlelogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Impede o navegador de recarregar a página
    try {
      const resposta = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (resposta.ok) {
        router.push("/login"); // Vai para a rua!
      }
    } catch (erro) {
      console.error("Erro ao fazer logout:", erro);
    }
  };

  return (
    <aside className={styles.sidebar} id="sidebar-navigation">
      {/* Logo */}
      <div className={styles["sidebar-logo"]}>
        <div className={styles["sidebar-logo-icon"]}>
          <Heart size={20} strokeWidth={2.5} />
        </div>
        <div className={styles["sidebar-logo-text"]}>
          <span className={styles["sidebar-logo-instituto"]}>instituto</span>
          <span className={styles["sidebar-logo-mondo"]}> mondó</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles["sidebar-nav"]}>
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
              className={`${styles["sidebar-nav-item"]} ${isActive ? styles["sidebar-nav-item-active"] : ""}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={styles["sidebar-footer"]}>
        <a
          href="#"
          onClick={handlelogout}
          className={`${styles["sidebar-nav-item"]} ${styles["sidebar-logout"]}`}
          id="btn-logout"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </a>

        {/* Branding */}
        <div className={styles["sidebar-branding"]}>
          <p className={styles["sidebar-branding-text"]}>
            Juntes por um futuro melhor!
          </p>
        </div>
      </div>
    </aside>
  );
}
