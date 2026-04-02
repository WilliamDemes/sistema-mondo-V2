import Link from "next/link";
import { families, getDashboardStats, currentUser } from "@/models/store";
import {
  Users,
  UserCheck,
  Stethoscope,
  CalendarCheck,
  ArrowRight,
  Plus,
  ChevronRight,
} from "lucide-react";
import styles from "./Home.module.css";
import { cookies } from "next/headers";
import { decrypt } from "../../../utils/session";

export default async function HomePage() {
  // 1. Abre o cofre de cookies (o await avisa pro servidor esperar abrir)
  const cookieStore = await cookies();

  // 2. Pega o valor do crachá chamado "session"
  const token = cookieStore.get("session")?.value;

  // 3. Passa o scanner (decrypt) para ler os dados (também precisa esperar)
  const sessao = token ? await decrypt(token) : null;

  // 4. Pegamos o primeiro nome
  const nomeUsuario = sessao?.firstName;

  // 5. formatando o nome
  const nomeFormatado = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1).toLowerCase();

  const stats = getDashboardStats();

  const statCards = [
    {
      label: "Famílias Ativas",
      value: stats.activeFamilies,
      icon: Users,
      color: "#6B7F3E",
      borderColor: "#6B7F3E",
    },
    {
      label: "Moradores Ativos",
      value: stats.totalBeneficiaries,
      icon: UserCheck,
      color: "#C9943E",
      borderColor: "#C9943E",
    },
    {
      label: "Atendimentos",
      value: stats.totalAtendimentos,
      icon: Stethoscope,
      color: "#C0272D",
      borderColor: "#C0272D",
    },
    {
      label: "Atividades",
      value: stats.totalAtividades,
      icon: CalendarCheck,
      color: "#009999",
      borderColor: "#009999",
    },
  ];

  const recentFamilies = families.filter((f) => f.status === "ATIVA");

  return (
    <div className={styles["home-page"]}>
      {/* Welcome section */}
      <section className={styles["home-welcome"]}>
        <h1 className={styles["home-welcome-title"]}>
          Bem-vindo(a), {nomeFormatado}
        </h1>
        <p className={styles["home-welcome-subtitle"]}>
          Gerencie atendimentos, atividades e participações das famílias
          acompanhadas pelo Instituto Mondó de forma simples e organizada.
        </p>
      </section>

      {/* Stats cards */}
      <section className={styles["home-stats"]} id="dashboard-stats">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={styles["stat-card"]}
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className={styles["stat-card-header"]}>
                <span className={styles["stat-card-label"]}>{card.label}</span>
                <div
                  className={styles["stat-card-icon"]}
                  style={{ color: card.color, background: `${card.color}12` }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <span className={styles["stat-card-value"]}>{card.value}</span>
            </div>
          );
        })}
        <Link
          href="/relatorios"
          className={`${styles["stat-card"]} ${styles["stat-card-cta"]}`}
          id="btn-ver-relatorios"
        >
          <span className={styles["stat-card-cta-text"]}>Ver Relatórios</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Recent families */}
      <section className={styles["home-families"]} id="recent-families">
        <div className={styles["home-families-header"]}>
          <h2 className={styles["home-families-title"]}>Famílias Recentes</h2>
          <Link
            href="/familias"
            className={styles["home-families-add"]}
            id="btn-nova-familia"
          >
            <Plus size={16} />
            Nova Família
          </Link>
        </div>
        <div className={styles["home-families-list"]}>
          {recentFamilies.map((family) => (
            <Link
              key={family.id}
              href={`/familias/${family.id}`}
              className={styles["family-row"]}
              id={`family-${family.id}`}
            >
              <div className={styles["family-row-info"]}>
                <span className={styles["family-row-name"]}>
                  {family.familyName}
                </span>
                <span className={styles["family-row-territory"]}>
                  {family.territory}
                </span>
              </div>
              <ChevronRight size={18} className={styles["family-row-arrow"]} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
