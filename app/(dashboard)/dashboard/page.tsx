"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, Home, Stethoscope, ClipboardList, TrendingUp, BarChart3, Activity, MapPin, Calendar, Loader2 } from "lucide-react";
import styles from "./Dashboard.module.css";

interface MonthlyData { month: string; count: number; }
interface TopFamily { id: string; name: string; territory: string; status: string; count: number; members: number; }
interface RecentActivity { id: string; title: string; type: string; format: string; date: string; description: string | null; participationCount: number; }
interface TerritoryData { name: string; families: number; active: number; }
interface DashboardStats {
  activeFamilies: number; totalFamilies: number; totalBeneficiaries: number; activeBeneficiaries: number;
  totalAtendimentos: number; totalAtividades: number; totalParticipations: number;
  monthlyParticipations: MonthlyData[]; topFamilies: TopFamily[]; recentActivities: RecentActivity[]; territories: TerritoryData[];
}

function fmtDate(d: string) { return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }); }

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) setStats(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80, color: "#8B7355", flexDirection: "column", gap: 12 }}>
      <Loader2 size={32} className="spinner" /><p>Carregando dashboard...</p>
      <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!stats) return <div style={{ padding: 40, textAlign: "center", color: "#8B7355" }}>Erro ao carregar dados.</div>;

  const maxMonthly = Math.max(...stats.monthlyParticipations.map(m => m.count), 1);
  const totalActivitiesAndAtendimentos = stats.totalAtividades + stats.totalAtendimentos;
  const atividadePct = totalActivitiesAndAtendimentos ? Math.round((stats.totalAtividades / totalActivitiesAndAtendimentos) * 100) : 50;
  const atendimentoPct = 100 - atividadePct;

  return (
    <div className={styles.dp}>
      <div className={styles["dp-header"]}><div><h1 className={styles["dp-title"]}>Dashboard</h1><p className={styles["dp-sub"]}>Visão geral dos indicadores do Instituto Mondó</p></div></div>

      {/* KPI Cards */}
      <div className={styles["kpi-grid"]}>
        <div className={styles.kpi} style={{ borderTopColor: "#C0272D" }}>
          <div className={styles["kpi-icon"]} style={{ background: "#C0272D12", color: "#C0272D" }}><Home size={22} /></div>
          <div className={styles["kpi-data"]}><span className={styles["kpi-val"]}>{stats.activeFamilies}</span><span className={styles["kpi-label"]}>Famílias Ativas</span><span className={styles["kpi-extra"]}>de {stats.totalFamilies} cadastradas</span></div>
        </div>
        <div className={styles.kpi} style={{ borderTopColor: "#009999" }}>
          <div className={styles["kpi-icon"]} style={{ background: "#00999912", color: "#009999" }}><Users size={22} /></div>
          <div className={styles["kpi-data"]}><span className={styles["kpi-val"]}>{stats.totalBeneficiaries}</span><span className={styles["kpi-label"]}>Beneficiários</span><span className={styles["kpi-extra"]}>{stats.activeBeneficiaries} em famílias ativas</span></div>
        </div>
        <div className={styles.kpi} style={{ borderTopColor: "#6B7F3E" }}>
          <div className={styles["kpi-icon"]} style={{ background: "#6B7F3E12", color: "#6B7F3E" }}><Stethoscope size={22} /></div>
          <div className={styles["kpi-data"]}><span className={styles["kpi-val"]}>{stats.totalAtendimentos}</span><span className={styles["kpi-label"]}>Atendimentos</span><span className={styles["kpi-extra"]}>registrados</span></div>
        </div>
        <div className={styles.kpi} style={{ borderTopColor: "#C9943E" }}>
          <div className={styles["kpi-icon"]} style={{ background: "#C9943E12", color: "#C9943E" }}><ClipboardList size={22} /></div>
          <div className={styles["kpi-data"]}><span className={styles["kpi-val"]}>{stats.totalAtividades}</span><span className={styles["kpi-label"]}>Atividades</span><span className={styles["kpi-extra"]}>realizadas</span></div>
        </div>
        <div className={styles.kpi} style={{ borderTopColor: "#491B02" }}>
          <div className={styles["kpi-icon"]} style={{ background: "#491B0212", color: "#491B02" }}><TrendingUp size={22} /></div>
          <div className={styles["kpi-data"]}><span className={styles["kpi-val"]}>{stats.totalParticipations}</span><span className={styles["kpi-label"]}>Participações</span><span className={styles["kpi-extra"]}>famílias em ações</span></div>
        </div>
      </div>

      <div className={styles["dp-grid"]}>
        {/* Bar Chart */}
        <section className={`${styles["dp-card"]} ${styles["dp-chart"]}`}>
          <div className={styles["dc-h"]}><BarChart3 size={18} className={styles["dc-icon"]} /><h2 className={styles["dc-t"]}>Participações por Mês</h2></div>
          <div className={styles["bar-chart"]}>
            {stats.monthlyParticipations.map((m, i) => (
              <div key={i} className={styles["bar-col"]}>
                <div className={styles["bar-val"]}>{m.count}</div>
                <div className={styles["bar-bg"]}><div className={styles["bar-fill"]} style={{ height: `${(m.count / maxMonthly) * 100}%` }} /></div>
                <div className={styles["bar-label"]}>{m.month}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Donut Chart */}
        <section className={`${styles["dp-card"]} ${styles["dp-donut-card"]}`}>
          <div className={styles["dc-h"]}><Activity size={18} className={styles["dc-icon"]} /><h2 className={styles["dc-t"]}>Distribuição</h2></div>
          <div className={styles["donut-wrap"]}>
            <div className={styles.donut} style={{ background: `conic-gradient(#009999 0% ${atividadePct}%, #6B7F3E ${atividadePct}% 100%)` }}>
              <div className={styles["donut-inner"]}><span className={styles["donut-total"]}>{totalActivitiesAndAtendimentos}</span><span className={styles["donut-label"]}>total</span></div>
            </div>
            <div className={styles["donut-legend"]}>
              <div className={styles["dl-item"]}><div className={styles["dl-dot"]} style={{ background: "#009999" }} /><span className={styles["dl-name"]}>Atividades</span><span className={styles["dl-val"]}>{stats.totalAtividades} ({atividadePct}%)</span></div>
              <div className={styles["dl-item"]}><div className={styles["dl-dot"]} style={{ background: "#6B7F3E" }} /><span className={styles["dl-name"]}>Atendimentos</span><span className={styles["dl-val"]}>{stats.totalAtendimentos} ({atendimentoPct}%)</span></div>
            </div>
          </div>
        </section>

        {/* Top Families */}
        <section className={`${styles["dp-card"]} ${styles["dp-top"]}`}>
          <div className={styles["dc-h"]}><TrendingUp size={18} className={styles["dc-icon"]} /><h2 className={styles["dc-t"]}>Famílias Mais Ativas</h2></div>
          <div className={styles["top-list"]}>
            {stats.topFamilies.map((f, i) => (
              <div key={f.id} className={styles["top-item"]}>
                <div className={styles["top-rank"]}>{i + 1}º</div>
                <div className={styles["top-info"]}>
                  <span className={styles["top-name"]}>{f.name}</span>
                  <span className={styles["top-meta"]}>{f.territory} • {f.members} integrantes</span>
                </div>
                <div className={styles["top-count"]}>
                  <span className={styles["top-num"]}>{f.count}</span>
                  <span className={styles["top-unit"]}>participações</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activities */}
        <section className={`${styles["dp-card"]} ${styles["dp-recent"]}`}>
          <div className={styles["dc-h"]}><Calendar size={18} className={styles["dc-icon"]} /><h2 className={styles["dc-t"]}>Atividades Recentes</h2></div>
          <div className={styles["recent-list"]}>
            {stats.recentActivities.map(a => {
              const isA = a.type === "ATENDIMENTO";
              return (
                <div key={a.id} className={styles["recent-item"]}>
                  <div className={styles["ri-bar"]} style={{ background: isA ? "#6B7F3E" : "#009999" }} />
                  <div className={styles["ri-info"]}>
                    <div className={styles["ri-top"]}><span className={styles["ri-name"]}>{a.title}</span><span className={`${styles["ri-tag"]} ${isA ? styles["ri-ta"] : styles["ri-tv"]}`}>{isA ? "Atendimento" : "Atividade"}</span></div>
                    <div className={styles["ri-bottom"]}><span className={styles["ri-date"]}>{fmtDate(a.date)}</span><span className={styles["ri-dot"]}>•</span><span className={styles["ri-part"]}>{a.participationCount} famílias</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Territories */}
        <section className={`${styles["dp-card"]} ${styles["dp-terr"]}`}>
          <div className={styles["dc-h"]}><MapPin size={18} className={styles["dc-icon"]} /><h2 className={styles["dc-t"]}>Territórios</h2></div>
          <div className={styles["terr-list"]}>
            {stats.territories.map(t => (
              <div key={t.name} className={styles["terr-item"]}>
                <div className={styles["terr-bar"]} style={{ width: `${(t.families / Math.max(...stats.territories.map(x => x.families), 1)) * 100}%` }} />
                <div className={styles["terr-info"]}>
                  <span className={styles["terr-name"]}>{t.name}</span>
                  <span className={styles["terr-meta"]}>{t.families} famílias ({t.active} ativas)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
