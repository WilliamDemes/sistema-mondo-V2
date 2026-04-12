"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import styles from "./Dashboard.module.css";
import { DashboardItem } from "../home/fakeData";

interface MonthlyData { month: string; count: number; }
interface TerritoryData { name: string; families: number; active: number; }
interface DashboardStats {
  familiasAtivas: number; totalFamilias: number; moradoresAtivos: number; atendimentos: number;
  atividades: number; totalParticipacoes: number; participacaoMensal: MonthlyData[];
  territorios: TerritoryData[];
  // e outros... 
}

export default function ChartsClientUI({ stats, filteredFakeData }: { stats: DashboardStats, filteredFakeData: DashboardItem[] }) {
  
  // ── 1. Preparo dos Dados: Evolução (Área) ── 
  const areaData = useMemo(() => {
    return stats.participacaoMensal.map(m => ({
      name: m.month,
      Participantes: m.count
    }));
  }, [stats.participacaoMensal]);

  // ── 2. Preparo dos Dados: Distribuição de Territórios (Doughnut) ──
  const PIE_COLORS = ["#009999", "#C9943E", "#C0272D", "#6B7F3E", "#D4AF37", "#8E44AD"];
  const pieData = useMemo(() => {
    return stats.territorios.map(t => ({
      name: t.name,
      value: t.families
    }));
  }, [stats.territorios]);

  // ── 3. Preparo dos Dados: Ranking de Atividades (Barras Horizontais) ──
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredFakeData.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    
    // Sort and get Top 5
    const top = Object.keys(counts)
      .map(k => ({ name: k, Ações: counts[k] }))
      .sort((a,b) => b.Ações - a.Ações)
      .slice(0, 5);
      
    return top;
  }, [filteredFakeData]);

  // ── 4. Preparo dos Dados: Teia Institucional (Radar) ──
  const radarData = useMemo(() => {
    const raw: Record<string, number> = {
      "Doação": 0, "Consultoria": 0, "Cursos": 0, "Atendimentos": 0, "Rodas. Conv.": 0
    };
    filteredFakeData.forEach(f => {
      if (f.category === "Doação") raw["Doação"]++;
      if (f.category === "Consultoria") raw["Consultoria"]++;
      if (f.category === "Cursos") raw["Cursos"]++;
      if (f.category === "Atendimentos") raw["Atendimentos"]++;
      if (f.category === "Rodas de Conversa") raw["Rodas. Conv."]++;
    });

    // Find Max to normalize if needed, or just let Radar handle mapping
    return Object.keys(raw).map(key => ({
      subject: key,
      A: raw[key],
      fullMark: Math.max(...Object.values(raw).map(v => v || 1)) + 2 // Ensures there is a margin
    }));
  }, [filteredFakeData]);

  // Custom Tooltip estilizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles["chart-tooltip"]}>
          <p className={styles["chart-tt-label"]}>{label}</p>
          <p className={styles["chart-tt-val"]} style={{color: payload[0].color || '#C0272D'}}>
            {payload[0].name}: <strong>{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles["charts-grid"]}>
      {/* 1. Gráfico de Área */}
      <div className={styles["chart-card"]} style={{ gridColumn: "1 / -1" }}>
        <div className={styles["chart-header"]}>Evolução de Participações (Mensal)</div>
        <div className={styles["chart-box"]} style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7F3E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6B7F3E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D5C0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8B7355', fontSize: 13}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#8B7355', fontSize: 13}} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Participantes" stroke="#6B7F3E" strokeWidth={3} fillOpacity={1} fill="url(#colorPart)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Distribuição Doughnut */}
      <div className={styles["chart-card"]}>
        <div className={styles["chart-header"]}>Famílias Assistidas (Por Território)</div>
        <div className={styles["chart-box"]}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles["pie-overlay-text"]}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#491B02' }}>{stats.totalFamilias}</span>
            <span style={{ fontSize: 12, color: '#8B7355' }}>Total</span>
          </div>
        </div>
      </div>

      {/* 3. Barras Horizontais (Top 5) */}
      <div className={styles["chart-card"]}>
        <div className={styles["chart-header"]}>Formato das Ações Realizadas (Top 5)</div>
        <div className={styles["chart-box"]}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E8D5C0" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#491B02', fontSize: 13, fontWeight: 600}} width={90} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#FDF9F2'}} />
              <Bar dataKey="Ações" fill="#C9943E" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Gráfico Radar (Áreas) */}
      <div className={styles["chart-card"]}>
        <div className={styles["chart-header"]}>Equilíbrio de Atuação Institucional</div>
        <div className={styles["chart-box"]}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={70} data={radarData}>
              <PolarGrid stroke="#E8D5C0" />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#8B7355', fontSize: 11, fontWeight: 600}} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
              <Radar name="Ações" dataKey="A" stroke="#C0272D" strokeWidth={2} fill="#C0272D" fillOpacity={0.2} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
