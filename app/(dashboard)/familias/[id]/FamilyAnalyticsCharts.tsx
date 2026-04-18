"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { line, curveCardinalClosed } from "d3-shape";
import styles from "./FamilyAnalyticsCharts.module.css";

// --- MOCK DATA: Radar Chart com 8 Rodadas ---
// Visão 1: Agregada (Dimensões Principais)
const mockRadarAggregated = [
  { subject: "Educação", R1: 80, R2: 75, R3: 70, R4: 55, R5: 50, R6: 45, R7: 40, R8: 25, fullMark: 100 },
  { subject: "Saúde", R1: 50, R2: 50, R3: 45, R4: 40, R5: 40, R6: 35, R7: 35, R8: 20, fullMark: 100 },
  { subject: "Renda", R1: 90, R2: 85, R3: 80, R4: 75, R5: 75, R6: 60, R7: 55, R8: 40, fullMark: 100 },
  { subject: "Infraestrutura", R1: 65, R2: 65, R3: 65, R4: 60, R5: 60, R6: 55, R7: 55, R8: 50, fullMark: 100 },
  { subject: "Nutrição", R1: 85, R2: 80, R3: 70, R4: 55, R5: 40, R6: 30, R7: 20, R8: 15, fullMark: 100 },
];

// Visão 2: Detalhada (Subindicadores organizados geograficamente por Quadrante)
const mockRadarDetailed = [
  // Quadrante: Educação
  { subject: "Evazão Escolar", category: "Educação", R1: 90, R2: 85, R3: 80, R4: 65, R5: 50, R6: 40, R7: 20, R8: 10, fullMark: 100 },
  { subject: "Atraso", category: "Educação", R1: 60, R2: 60, R3: 50, R4: 50, R5: 45, R6: 40, R7: 30, R8: 20, fullMark: 100 },
  // Quadrante: Saúde
  { subject: "Pré-Natal", category: "Saúde", R1: 30, R2: 30, R3: 20, R4: 20, R5: 10, R6: 10, R7: 0, R8: 0, fullMark: 100 },
  { subject: "Vacinação", category: "Saúde", R1: 80, R2: 70, R3: 50, R4: 30, R5: 20, R6: 15, R7: 10, R8: 5, fullMark: 100 },
  // Quadrante: Renda
  { subject: "Renda Capita", category: "Renda", R1: 95, R2: 90, R3: 85, R4: 75, R5: 75, R6: 60, R7: 50, R8: 45, fullMark: 100 },
  // Quadrante: Infraestrutura
  { subject: "Saneamento", category: "Infra", R1: 50, R2: 50, R3: 50, R4: 45, R5: 45, R6: 40, R7: 40, R8: 30, fullMark: 100 },
  // Quadrante: Nutrição
  { subject: "Inseg. Alimentar", category: "Nutrição", R1: 60, R2: 60, R3: 55, R4: 50, R5: 45, R6: 40, R7: 35, R8: 20, fullMark: 100 },
  { subject: "Proteção", category: "Nutrição", R1: 70, R2: 65, R3: 65, R4: 60, R5: 50, R6: 45, R7: 40, R8: 35, fullMark: 100 },
];

// Mapeamento global de paletas para as Rodadas (Para fácil identificação visual)
const roundStyles: Record<string, { stroke: string, fill: string }> = {
  "R1": { stroke: "#8B7355", fill: "#E8D5C0" }, // Marrom antigo
  "R2": { stroke: "#A1887F", fill: "#D7CCC8" },
  "R3": { stroke: "#FFB74D", fill: "#FFE0B2" },
  "R4": { stroke: "#FF9800", fill: "#FFE0B2" },
  "R5": { stroke: "#FF7043", fill: "#FFCCBC" },
  "R6": { stroke: "#26C6DA", fill: "#B2EBF2" },
  "R7": { stroke: "#4DB6AC", fill: "#B2DFDB" },
  "R8": { stroke: "#009999", fill: "#007777" }, // Verde Mondó vibrante pro presente
};

// Dados baseados em cada Round
const ROUND_LIST = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"];

// --- MOCK DATA: Line Chart (Evolução da Pobreza no Tempo) ---
const mockLineTimeline = [
  { month: "Rodada 1", ipm: 80 }, 
  { month: "Rodada 2", ipm: 75 },
  { month: "Rodada 3", ipm: 62 },
  { month: "Rodada 4", ipm: 58 },
  { month: "Rodada 5", ipm: 45 },
  { month: "Rodada 6", ipm: 35 },
  { month: "Rodada 7", ipm: 28 },
  { month: "Rodada 8", ipm: 25 },
];

// Custom Tooltip Radar
const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.ttLabel}>{data.subject}</p>
        
        {/* Renderizamos as infos de cada Poligono Ativo */}
        {payload.map((entry: any, index: number) => {
          const roundId = entry.dataKey; // R1, R8, etc
          const scoreValue = data[roundId];
          const isCritical = scoreValue >= 70; // Alta vulnerabilidade
          
          return (
            <p key={index} className={`${styles.ttDesc} ${isCritical ? styles.ttDescAlert : ""}`} style={{ color: entry.color }}>
              {roundId}: {scoreValue}/100 (vulnerabilidade)
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// Custom Tooltip Linha
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.ttLabel}>{label}</p>
        <p className={styles.ttDesc}>
          Nível de Vulnerabilidade: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Renderer: Poligonos Orgânicos D3 ---
const CustomRadarShape = (props: any) => {
  const { points, stroke, fill, fillOpacity } = props;
  
  if (!points || points.length === 0) return null;

  // Usa d3-shape para criar um path SVG curvado perfeitamente que passa pelos pontos
  const pathGenerator = line<any>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveCardinalClosed.tension(0.4));
    
  const svgPath = pathGenerator(points);
  
  return (
    <path 
      d={svgPath || ""} 
      stroke={stroke} 
      strokeWidth={2.5} 
      fill={fill} 
      fillOpacity={fillOpacity} 
    />
  );
};

interface FamilyAnalyticsChartsProps {
  activeTab: "RADAR" | "LINE";
}

export function FamilyAnalyticsCharts({ activeTab }: FamilyAnalyticsChartsProps) {
  const [radarView, setRadarView] = useState<"AGGREGATED" | "DETAILED">("AGGREGATED");
  
  // Por padrao comparamos o extremo: A primeira visita (R1) com a ultima (R8)
  const [selectedRounds, setSelectedRounds] = useState<string[]>(["R1", "R8"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o modal caso cliquem fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleRound = (roundId: string) => {
    setSelectedRounds(prev => {
      // Se tiver ligado, e tivermos mais que 1, a gente permite desligar.
      if (prev.includes(roundId)) {
        if (prev.length === 1) return prev; // Proteção: mínimo de 1 teia.
        return prev.filter(r => r !== roundId);
      }
      // Liga o round
      return [...prev, roundId].sort();
    });
  };

  const currentRadarData = radarView === "AGGREGATED" ? mockRadarAggregated : mockRadarDetailed;

  return (
    <div className={styles.analyticsContainer}>
        
        {/* === VISUALIZAÇÃO: Radar Chart de Violações === */}
        {activeTab === "RADAR" && (
          <div className={styles.chartCard} style={{ zIndex: 10, width: '100%', animation: 'slideFadeIn 0.3s ease' }}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitleWrapper}>
                <h3 className={styles.chartTitle}>Violações (IPM) - Área Comparativa</h3>
                <p className={styles.chartSub}>Observe a contração da vulnerabilidade sobre a família.</p>
              </div>
              
              <div className={styles.chartActionsPanel}>
                <div className={styles.toggleContainer}>
                  <button 
                    className={`${styles.toggleBtn} ${radarView === "AGGREGATED" ? styles.active : ""}`}
                    onClick={() => setRadarView("AGGREGATED")}
                  >
                    Dimensões
                  </button>
                  <button 
                    className={`${styles.toggleBtn} ${radarView === "DETAILED" ? styles.active : ""}`}
                    onClick={() => setRadarView("DETAILED")}
                  >
                    Sub-indicadores
                  </button>
                </div>

                {/* Botão Flutuante de Seleção de Rodadas Oculto */}
                <div className={styles.dropdownSelectorWrapper} ref={dropdownRef}>
                  <button 
                    className={styles.dropdownTrigger} 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    title="Sobrepor rodadas antigas e novas"
                  >
                    Comparar Rodadas ({selectedRounds.length}) <ChevronDown size={14} />
                  </button>

                  {dropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {ROUND_LIST.map(round => (
                        <label key={round} className={styles.dropdownItemLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.dropdownItemCheck}
                            checked={selectedRounds.includes(round)}
                            onChange={() => handleToggleRound(round)}
                          />
                          Rodada {round.replace('R', '')}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={currentRadarData}>
                  <PolarGrid gridType="circle" stroke="#E8D5C0" />
                  <PolarAngleAxis 
                    dataKey="subject"  
                    tick={{ fill: '#8B7355', fontSize: 10, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={false} 
                    axisLine={false} 
                  />
                  <RechartsTooltip content={<CustomRadarTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#491B02', paddingTop: '10px' }} />
                  
                  {/* Aqui Mapeamos de Forma Dinamica as Rodadas Ligadas Pelo Usuario! */}
                  {selectedRounds.map((roundId, index) => (
                     <Radar
                      key={roundId}
                      name={roundId}
                      dataKey={roundId}
                      shape={<CustomRadarShape />}
                      stroke={roundStyles[roundId]?.stroke || "#333"}
                      fill={roundStyles[roundId]?.fill || "#CCC"}
                      fillOpacity={0.4}
                      dot={false}
                    />
                  ))}

                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* === VISUALIZAÇÃO: Line Chart Evolução no Tempo === */}
        {activeTab === "LINE" && (
          <div className={styles.chartCard} style={{ zIndex: 1, width: '100%', animation: 'slideFadeIn 0.3s ease' }}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitleWrapper}>
                <h3 className={styles.chartTitle}>Avanço e Progresso Histórico</h3>
                <p className={styles.chartSub}>Monitoramento global do impacto assistencial.</p>
              </div>
            </div>

            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLineTimeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#8B7355', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#8B7355', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomLineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="ipm"
                    stroke="#009999"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#009999', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

    </div>
  );
}
