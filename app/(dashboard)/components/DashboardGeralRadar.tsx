"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { line, curveCardinalClosed } from "d3-shape";

// Este é um componente visual simples para agrupar as violações de todas as famílias pela coluna "dimensao".
// Posteriormente, ele deve ser conectado à uma rota de API (ex: /api/dashboard/dimensoes) que traga os dados agregados.

interface DimensaoAgregada {
  dimensao: string;
  mediaViolacao: number; // Média proporcional de 0 a 1
}

// Dados mockados para exemplo
const DADOS_MOCK: DimensaoAgregada[] = [
  { dimensao: "Saúde", mediaViolacao: 0.4 },
  { dimensao: "Educação", mediaViolacao: 0.7 },
  { dimensao: "Moradia/Água/Energia", mediaViolacao: 0.2 },
  { dimensao: "Des. Econômico", mediaViolacao: 0.8 },
  { dimensao: "Nutrição", mediaViolacao: 0.1 },
];

// --- Custom Renderer: Polígonos Orgânicos D3 ---
const FormaRadarCustomizada = (props: any) => {
  const { points: pontos, stroke: corBorda, fill: corPreenchimento, fillOpacity: opacidadePreenchimento } = props;

  if (!pontos || pontos.length === 0) return null;

  const geradorCaminho = line<any>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveCardinalClosed.tension(0.4));

  return (
    <path
      d={geradorCaminho(pontos) || ""}
      stroke={corBorda}
      strokeWidth={2.5}
      fill={corPreenchimento}
      fillOpacity={opacidadePreenchimento}
    />
  );
};

// Custom Tooltip
const TooltipRadarCustomizado = ({ active: ativo, payload: dadosOrigem }: any) => {
  if (ativo && dadosOrigem && dadosOrigem.length) {
    const dados = dadosOrigem[0].payload;
    const valor = dados.mediaViolacao;
    const eCritico = valor >= 0.7;

    return (
      <div style={{ background: "#FEFBF7", padding: "12px", border: "1px solid #E8D5C0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#491B02", fontSize: "13px" }}>{dados.dimensao}</p>
        <p style={{ margin: 0, marginTop: "4px", fontSize: "12px", color: eCritico ? "#C0272D" : "#8B7355", fontWeight: eCritico ? 600 : 400 }}>
          Média Geral: {valor.toFixed(2)}/1
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardGeralRadar() {
  const [dados] = useState<DimensaoAgregada[]>(DADOS_MOCK);

  // Ordenação opcional para agrupar as maiores médias
  const dadosOrdenados = useMemo(() => {
    return [...dados].sort((a, b) => b.mediaViolacao - a.mediaViolacao);
  }, [dados]);

  return (
    <div style={{ background: "#fff", border: "1px solid #E8D5C0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(139, 115, 85, 0.05)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#491B02", fontSize: "16px", fontWeight: 600 }}>Média de Vulnerabilidade por Dimensão</h3>
        <p style={{ margin: 0, color: "#8B7355", fontSize: "13px", marginTop: "4px" }}>Visualização agregada de todas as famílias assistidas.</p>
      </div>

      <div style={{ width: "100%", height: "350px" }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dadosOrdenados}>
            <PolarGrid gridType="circle" stroke="#E8D5C0" />
            <PolarAngleAxis
              dataKey="dimensao"
              tick={{ fill: "#8B7355", fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 1]}
              tick={false}
              axisLine={false}
            />
            <RechartsTooltip content={<TooltipRadarCustomizado />} />
            
            <Radar
              name="Média Geral"
              dataKey="mediaViolacao"
              shape={<FormaRadarCustomizada />}
              stroke="#8B7355"
              fill="#E8D5C0"
              fillOpacity={0.6}
              dot={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
