import Link from "next/link";
import {
  families,
  getDashboardStats,
  currentUser,
} from "@/models/store";
import {
  Users,
  UserCheck,
  Stethoscope,
  CalendarCheck,
  ArrowRight,
  Plus,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
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
    <div className="home-page">
      {/* Welcome section */}
      <section className="home-welcome">
        <h1 className="home-welcome-title">Bem-vinda, {currentUser.name}</h1>
        <p className="home-welcome-subtitle">
          Gerencie atendimentos, atividades e participações das famílias acompanhadas pelo Instituto Mondó de forma simples e organizada.
        </p>
      </section>

      {/* Stats cards */}
      <section className="home-stats" id="dashboard-stats">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="stat-card"
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className="stat-card-header">
                <span className="stat-card-label">{card.label}</span>
                <div className="stat-card-icon" style={{ color: card.color, background: `${card.color}12` }}>
                  <Icon size={18} />
                </div>
              </div>
              <span className="stat-card-value">{card.value}</span>
            </div>
          );
        })}
        <Link href="/relatorios" className="stat-card stat-card-cta" id="btn-ver-relatorios">
          <span className="stat-card-cta-text">Ver Relatórios</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Recent families */}
      <section className="home-families" id="recent-families">
        <div className="home-families-header">
          <h2 className="home-families-title">Famílias Recentes</h2>
          <Link href="/familias" className="home-families-add" id="btn-nova-familia">
            <Plus size={16} />
            Nova Família
          </Link>
        </div>
        <div className="home-families-list">
          {recentFamilies.map((family) => (
            <Link
              key={family.id}
              href={`/familias/${family.id}`}
              className="family-row"
              id={`family-${family.id}`}
            >
              <div className="family-row-info">
                <span className="family-row-name">{family.familyName}</span>
                <span className="family-row-territory">{family.territory}</span>
              </div>
              <ChevronRight size={18} className="family-row-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .home-page {
          max-width: 1100px;
        }

        .home-welcome {
          margin-bottom: 32px;
        }

        .home-welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: #491B02;
          margin-bottom: 8px;
        }

        .home-welcome-subtitle {
          font-size: 15px;
          color: #8B7355;
          line-height: 1.6;
          max-width: 640px;
        }

        .home-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 36px;
        }

        .stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid transparent;
          box-shadow: 0 1px 3px rgba(73, 27, 2, 0.06);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(73, 27, 2, 0.1);
          transform: translateY(-2px);
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-card-label {
          font-size: 13px;
          font-weight: 600;
          color: #6B3A1F;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .stat-card-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card-value {
          font-size: 36px;
          font-weight: 800;
          color: #491B02;
        }

        .stat-card-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #C9943E, #D4A855);
          color: #FFFFFF;
          text-decoration: none;
          border-left: none;
          font-weight: 600;
          font-size: 14px;
        }

        .stat-card-cta:hover {
          background: linear-gradient(135deg, #B8853A, #C9943E);
        }

        .stat-card-cta-text {
          font-weight: 600;
        }

        .home-families {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(73, 27, 2, 0.06);
        }

        .home-families-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .home-families-title {
          font-size: 20px;
          font-weight: 700;
          color: #491B02;
        }

        .home-families-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          color: #C0272D;
          border: 2px solid #C0272D;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .home-families-add:hover {
          background: #C0272D;
          color: #FDF6ED;
        }

        .home-families-list {
          display: flex;
          flex-direction: column;
        }

        .family-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px;
          border-bottom: 1px solid #F0E6D8;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .family-row:last-child {
          border-bottom: none;
        }

        .family-row:hover {
          padding-left: 12px;
          background: #FDF6ED;
          border-radius: 8px;
        }

        .family-row-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .family-row-name {
          font-size: 15px;
          font-weight: 600;
          color: #491B02;
        }

        .family-row-territory {
          font-size: 12px;
          color: #8B7355;
        }

        .family-row-arrow {
          color: #C9943E;
        }
      `}</style>
    </div>
  );
}
