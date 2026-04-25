"use client";

import React from "react";
import estilos from "./StatusCiclos.module.css";

// --- Tipagem ---
type StatusCiclo =
  | "CONCLUIDA"
  | "AUSENTE"
  | "NAO_ENCONTRADA"
  | "RECUSOU"
  | "DESISTIU"
  | "PENDENTE"
  | "NAO_ELEGIVEL";

interface CicloColeta {
  rodada: number;
  status: StatusCiclo;
  dataColeta: string | null;
}

interface PropsStatusCiclos {
  ciclos?: CicloColeta[];
}

// --- Dados Mockados ---
const DADOS_MOCK: CicloColeta[] = [
  { rodada: 1, status: "CONCLUIDA", dataColeta: "15/03/2023" },
  { rodada: 2, status: "CONCLUIDA", dataColeta: "12/06/2023" },
  { rodada: 3, status: "AUSENTE", dataColeta: null },
  { rodada: 4, status: "CONCLUIDA", dataColeta: "20/12/2023" },
  { rodada: 5, status: "NAO_ENCONTRADA", dataColeta: null },
  { rodada: 6, status: "CONCLUIDA", dataColeta: "10/06/2024" },
  { rodada: 7, status: "RECUSOU", dataColeta: null },
  { rodada: 8, status: "PENDENTE", dataColeta: null },
];

// --- Mapeamento Visual ---
const MAPA_STATUS: Record<StatusCiclo, { rotulo: string; cor: string }> = {
  CONCLUIDA:      { rotulo: "Concluída",          cor: "#059669" },
  AUSENTE:        { rotulo: "Ausente",            cor: "#E65100" },
  NAO_ENCONTRADA: { rotulo: "Não encontrada",     cor: "#DC2626" },
  RECUSOU:        { rotulo: "Recusou participar",  cor: "#AD1457" },
  DESISTIU:       { rotulo: "Desistiu",           cor: "#6A1B9A" },
  PENDENTE:       { rotulo: "Pendente",           cor: "#8B7355" },
  NAO_ELEGIVEL:   { rotulo: "Não elegível",       cor: "#9E9E9E" },
};

// --- Componente Compacto ---
export function StatusCiclos({ ciclos }: PropsStatusCiclos) {
  const dadosCiclos = ciclos && ciclos.length > 0 ? ciclos : DADOS_MOCK;

  return (
    <div className={estilos.containerInline}>
      <span className={estilos.rotuloInline}>Ciclos</span>
      <div className={estilos.listaDots}>
        {dadosCiclos.map((ciclo) => {
          const config = MAPA_STATUS[ciclo.status];
          const textoTooltip = `R${ciclo.rodada}: ${config.rotulo}${ciclo.dataColeta ? ` — ${ciclo.dataColeta}` : ""}`;
          return (
            <div key={ciclo.rodada} className={estilos.dotWrapper}>
              <span
                className={estilos.dot}
                style={{ background: config.cor }}
              >
                {ciclo.rodada}
              </span>
              <span className={estilos.tooltip}>{textoTooltip}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
