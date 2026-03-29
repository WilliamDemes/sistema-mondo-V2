"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, Home, Stethoscope, ClipboardList, TrendingUp, BarChart3, Activity, MapPin, Calendar, Loader2 } from "lucide-react";

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
    <div className="dp">
      <div className="dp-header"><div><h1 className="dp-title">Dashboard</h1><p className="dp-sub">Visão geral dos indicadores do Instituto Mondó</p></div></div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi" style={{ borderTopColor: "#C0272D" }}>
          <div className="kpi-icon" style={{ background: "#C0272D12", color: "#C0272D" }}><Home size={22} /></div>
          <div className="kpi-data"><span className="kpi-val">{stats.activeFamilies}</span><span className="kpi-label">Famílias Ativas</span><span className="kpi-extra">de {stats.totalFamilies} cadastradas</span></div>
        </div>
        <div className="kpi" style={{ borderTopColor: "#009999" }}>
          <div className="kpi-icon" style={{ background: "#00999912", color: "#009999" }}><Users size={22} /></div>
          <div className="kpi-data"><span className="kpi-val">{stats.totalBeneficiaries}</span><span className="kpi-label">Beneficiários</span><span className="kpi-extra">{stats.activeBeneficiaries} em famílias ativas</span></div>
        </div>
        <div className="kpi" style={{ borderTopColor: "#6B7F3E" }}>
          <div className="kpi-icon" style={{ background: "#6B7F3E12", color: "#6B7F3E" }}><Stethoscope size={22} /></div>
          <div className="kpi-data"><span className="kpi-val">{stats.totalAtendimentos}</span><span className="kpi-label">Atendimentos</span><span className="kpi-extra">registrados</span></div>
        </div>
        <div className="kpi" style={{ borderTopColor: "#C9943E" }}>
          <div className="kpi-icon" style={{ background: "#C9943E12", color: "#C9943E" }}><ClipboardList size={22} /></div>
          <div className="kpi-data"><span className="kpi-val">{stats.totalAtividades}</span><span className="kpi-label">Atividades</span><span className="kpi-extra">realizadas</span></div>
        </div>
        <div className="kpi" style={{ borderTopColor: "#491B02" }}>
          <div className="kpi-icon" style={{ background: "#491B0212", color: "#491B02" }}><TrendingUp size={22} /></div>
          <div className="kpi-data"><span className="kpi-val">{stats.totalParticipations}</span><span className="kpi-label">Participações</span><span className="kpi-extra">famílias em ações</span></div>
        </div>
      </div>

      <div className="dp-grid">
        {/* Bar Chart */}
        <section className="dp-card dp-chart">
          <div className="dc-h"><BarChart3 size={18} className="dc-icon" /><h2 className="dc-t">Participações por Mês</h2></div>
          <div className="bar-chart">
            {stats.monthlyParticipations.map((m, i) => (
              <div key={i} className="bar-col">
                <div className="bar-val">{m.count}</div>
                <div className="bar-bg"><div className="bar-fill" style={{ height: `${(m.count / maxMonthly) * 100}%` }} /></div>
                <div className="bar-label">{m.month}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Donut Chart */}
        <section className="dp-card dp-donut-card">
          <div className="dc-h"><Activity size={18} className="dc-icon" /><h2 className="dc-t">Distribuição</h2></div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(#009999 0% ${atividadePct}%, #6B7F3E ${atividadePct}% 100%)` }}>
              <div className="donut-inner"><span className="donut-total">{totalActivitiesAndAtendimentos}</span><span className="donut-label">total</span></div>
            </div>
            <div className="donut-legend">
              <div className="dl-item"><div className="dl-dot" style={{ background: "#009999" }} /><span className="dl-name">Atividades</span><span className="dl-val">{stats.totalAtividades} ({atividadePct}%)</span></div>
              <div className="dl-item"><div className="dl-dot" style={{ background: "#6B7F3E" }} /><span className="dl-name">Atendimentos</span><span className="dl-val">{stats.totalAtendimentos} ({atendimentoPct}%)</span></div>
            </div>
          </div>
        </section>

        {/* Top Families */}
        <section className="dp-card dp-top">
          <div className="dc-h"><TrendingUp size={18} className="dc-icon" /><h2 className="dc-t">Famílias Mais Ativas</h2></div>
          <div className="top-list">
            {stats.topFamilies.map((f, i) => (
              <div key={f.id} className="top-item">
                <div className="top-rank">{i + 1}º</div>
                <div className="top-info">
                  <span className="top-name">{f.name}</span>
                  <span className="top-meta">{f.territory} • {f.members} integrantes</span>
                </div>
                <div className="top-count">
                  <span className="top-num">{f.count}</span>
                  <span className="top-unit">participações</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activities */}
        <section className="dp-card dp-recent">
          <div className="dc-h"><Calendar size={18} className="dc-icon" /><h2 className="dc-t">Atividades Recentes</h2></div>
          <div className="recent-list">
            {stats.recentActivities.map(a => {
              const isA = a.type === "ATENDIMENTO";
              return (
                <div key={a.id} className="recent-item">
                  <div className="ri-bar" style={{ background: isA ? "#6B7F3E" : "#009999" }} />
                  <div className="ri-info">
                    <div className="ri-top"><span className="ri-name">{a.title}</span><span className={`ri-tag ${isA ? "ri-ta" : "ri-tv"}`}>{isA ? "Atendimento" : "Atividade"}</span></div>
                    <div className="ri-bottom"><span className="ri-date">{fmtDate(a.date)}</span><span className="ri-dot">•</span><span className="ri-part">{a.participationCount} famílias</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Territories */}
        <section className="dp-card dp-terr">
          <div className="dc-h"><MapPin size={18} className="dc-icon" /><h2 className="dc-t">Territórios</h2></div>
          <div className="terr-list">
            {stats.territories.map(t => (
              <div key={t.name} className="terr-item">
                <div className="terr-bar" style={{ width: `${(t.families / Math.max(...stats.territories.map(x => x.families), 1)) * 100}%` }} />
                <div className="terr-info">
                  <span className="terr-name">{t.name}</span>
                  <span className="terr-meta">{t.families} famílias ({t.active} ativas)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .dp{max-width:1200px}
        .dp-header{margin-bottom:24px}.dp-title{font-size:28px;font-weight:700;color:#491B02;margin-bottom:4px}.dp-sub{font-size:14px;color:#8B7355}

        .kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:24px}
        .kpi{background:#FFF;border-radius:12px;padding:18px;border-top:3px solid;box-shadow:0 1px 3px rgba(73,27,2,.06);display:flex;align-items:center;gap:14px;transition:all .3s}.kpi:hover{box-shadow:0 4px 12px rgba(73,27,2,.1);transform:translateY(-2px)}
        .kpi-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .kpi-data{display:flex;flex-direction:column}.kpi-val{font-size:26px;font-weight:800;color:#491B02;line-height:1}.kpi-label{font-size:12px;font-weight:600;color:#6B3A1F;margin-top:2px}.kpi-extra{font-size:11px;color:#8B7355;margin-top:1px}

        .dp-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .dp-card{background:#FFF;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(73,27,2,.06)}
        .dc-h{display:flex;align-items:center;gap:8px;margin-bottom:16px}.dc-icon{color:#C9943E}.dc-t{font-size:16px;font-weight:700;color:#491B02}

        .bar-chart{display:flex;align-items:flex-end;gap:12px;height:180px;padding-top:20px}
        .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
        .bar-val{font-size:12px;font-weight:700;color:#491B02}
        .bar-bg{width:100%;height:140px;background:#F0E6D8;border-radius:6px 6px 0 0;position:relative;overflow:hidden;display:flex;align-items:flex-end}
        .bar-fill{width:100%;background:linear-gradient(180deg,#C9943E,#D4A855);border-radius:6px 6px 0 0;transition:height .6s ease;min-height:2px}
        .bar-label{font-size:11px;color:#8B7355;font-weight:500;white-space:nowrap}

        .donut-wrap{display:flex;align-items:center;gap:28px;padding:8px 0}
        .donut{width:140px;height:140px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .donut-inner{width:80px;height:80px;border-radius:50%;background:#FFF;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 4px rgba(255,255,255,.8)}.donut-total{font-size:24px;font-weight:800;color:#491B02;line-height:1}.donut-label{font-size:11px;color:#8B7355}
        .donut-legend{display:flex;flex-direction:column;gap:12px}.dl-item{display:flex;align-items:center;gap:8px}.dl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}.dl-name{font-size:13px;font-weight:600;color:#491B02}.dl-val{font-size:12px;color:#8B7355;margin-left:auto}

        .top-list{display:flex;flex-direction:column;gap:8px}
        .top-item{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#FEFBF7;border-radius:10px;border:1px solid #F0E6D8;transition:all .2s}.top-item:hover{border-color:#C9943E40;box-shadow:0 2px 6px rgba(73,27,2,.05)}
        .top-rank{font-size:16px;font-weight:800;color:#C9943E;min-width:28px}.top-info{flex:1;display:flex;flex-direction:column}.top-name{font-size:14px;font-weight:600;color:#491B02}.top-meta{font-size:12px;color:#8B7355}.top-count{text-align:right}.top-num{font-size:20px;font-weight:800;color:#491B02;display:block;line-height:1}.top-unit{font-size:10px;color:#8B7355;text-transform:uppercase}

        .recent-list{display:flex;flex-direction:column;gap:8px}
        .recent-item{display:flex;align-items:stretch;gap:0;background:#FEFBF7;border-radius:10px;border:1px solid #F0E6D8;overflow:hidden;transition:all .2s}.recent-item:hover{border-color:#C9943E40}
        .ri-bar{width:4px;flex-shrink:0}.ri-info{padding:10px 14px;flex:1}.ri-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}.ri-name{font-size:14px;font-weight:600;color:#491B02}.ri-tag{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;border:1.5px solid}.ri-ta{color:#6B7F3E;border-color:#6B7F3E;background:#6B7F3E10}.ri-tv{color:#009999;border-color:#009999;background:#00999910}
        .ri-bottom{font-size:12px;color:#8B7355;display:flex;gap:4px;align-items:center}.ri-dot{opacity:.4}

        .terr-list{display:flex;flex-direction:column;gap:12px}
        .terr-item{position:relative;padding:12px 16px;background:#FEFBF7;border-radius:8px;border:1px solid #F0E6D8;overflow:hidden}
        .terr-bar{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#C9943E10,#C9943E20);border-radius:8px 0 0 8px}
        .terr-info{position:relative;z-index:1}.terr-name{display:block;font-size:14px;font-weight:700;color:#491B02}.terr-meta{font-size:12px;color:#8B7355}

        :global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:900px){.dp-grid{grid-template-columns:1fr}.kpi-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>
    </div>
  );
}
