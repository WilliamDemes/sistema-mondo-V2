"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import styles from "./FamilyHistoryChart.module.css";

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

export function FamilyHistoryChart() {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleWrapper}>
          <h3 className={styles.chartTitle}>Avanço e Progresso Histórico</h3>
          <p className={styles.chartSub}>Monitoramento global do impacto assistencial.</p>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400} minWidth={0}>
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
  );
}
