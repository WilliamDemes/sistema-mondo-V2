"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { line, curveLinearClosed } from "d3-shape";
import styles from "./FamilyAnalyticsCharts.module.css";

// --- Tipagem dos Dados da API ---
interface LinhaIndicador {
  domiRodada: number | null;
  domiCod: number;
  indicadorResumido: string;
  violacao: number | null;
  tipo: string | null;
  dimensao: string;
}

interface PontoRadar {
  assunto: string;
  notaMaxima: number;
  [chaveRodada: string]: string | number;
}

// Mapeamento global de paletas para as Rodadas (Para fácil identificação visual)
const estilosRodada: Record<string, { stroke: string; fill: string }> = {
  "R1": { stroke: "#8B7355", fill: "#E8D5C0" },
  "R2": { stroke: "#A1887F", fill: "#D7CCC8" },
  "R3": { stroke: "#FFB74D", fill: "#FFE0B2" },
  "R4": { stroke: "#FF9800", fill: "#FFE0B2" },
  "R5": { stroke: "#FF7043", fill: "#FFCCBC" },
  "R6": { stroke: "#26C6DA", fill: "#B2EBF2" },
  "R7": { stroke: "#4DB6AC", fill: "#B2DFDB" },
  "R8": { stroke: "#009999", fill: "#007777" },
};

// Custom Tooltip Radar
const TooltipRadarCustomizado = ({ active: ativo, payload: dadosOrigem }: any) => {
  if (ativo && dadosOrigem && dadosOrigem.length) {
    const dados = dadosOrigem[0].payload;
    const idRodada = dadosOrigem[0].dataKey;
    const valorPontuacao = dados[idRodada];
    const eCritico = valorPontuacao === 1; // Como é só 0 ou 1, 1 é crítico

    return (
      <div className={styles.customTooltip}>
        <p className={styles.ttLabel}>{dados.assunto}</p>
        <p
          className={`${styles.ttDesc} ${eCritico ? styles.ttDescAlert : ""}`}
          style={{ color: dadosOrigem[0].color }}
        >
          {idRodada}: {valorPontuacao ?? 0}/1 (vulnerabilidade)
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Renderer: Polígonos Orgânicos D3 ---
const FormaRadarCustomizada = (props: any) => {
  const { points: pontos, stroke: corBorda, fill: corPreenchimento, fillOpacity: opacidadePreenchimento } = props;

  if (!pontos || pontos.length === 0) return null;

  // Usa d3-shape para criar um path SVG reto que acompanha a grade poligonal
  const geradorCaminho = line<any>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveLinearClosed);

  const caminhoSvg = geradorCaminho(pontos);

  return (
    <path
      d={caminhoSvg || ""}
      stroke={corBorda}
      strokeWidth={2.5}
      fill={corPreenchimento}
      fillOpacity={opacidadePreenchimento}
    />
  );
};

export function FamilyAnalyticsCharts({ familyId }: { familyId?: string }) {
  const [visaoRadar, setVisaoRadar] = useState<"INDICADORES" | "SUB_INDICADORES">("INDICADORES");
  const [rodadaSelecionada, setRodadaSelecionada] = useState<string>("");
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [dadosBrutos, setDadosBrutos] = useState<LinhaIndicador[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [rodadasDisponiveis, setRodadasDisponiveis] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o modal caso cliquem fora dele
  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(evento.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const buscarDados = useCallback(async () => {
    if (!familyId) return;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/familias/${familyId}/indicadores`);
      if (!resposta.ok) {
        throw new Error("Falha ao carregar os dados dos indicadores.");
      }
      const json: LinhaIndicador[] = await resposta.json();
      setDadosBrutos(json);

      // Identificar rodadas únicas disponíveis
      const rodadasSet = new Set<number>();
      json.forEach((item) => {
        if (item.domiRodada !== null) {
          rodadasSet.add(item.domiRodada);
        }
      });
      const rodadasOrdenadas = Array.from(rodadasSet)
        .sort((a, b) => a - b)
        .map((num) => `R${num}`);
      
      setRodadasDisponiveis(rodadasOrdenadas);

      // Pré-selecionar a última rodada por padrão
      if (rodadasOrdenadas.length > 0) {
        setRodadaSelecionada(rodadasOrdenadas[rodadasOrdenadas.length - 1]);
      }
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [familyId]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const normalizarString = (str: string) => str.toLowerCase().replace(/\s/g, "");

  const dadosTransformados = useMemo(() => {
    if (!rodadaSelecionada) return [];

    const mapa = new Map<string, number>(); // Assunto -> 1 ou 0

    dadosBrutos.forEach((linha) => {
      if (linha.domiRodada === null) return;
      
      const chaveRodada = `R${linha.domiRodada}`;
      // Ignoramos qualquer dado que não seja da rodada selecionada
      if (chaveRodada !== rodadaSelecionada) return;

      let chaveAssunto = "";
      const tipoNormalizado = linha.tipo ? normalizarString(linha.tipo) : "";

      if (visaoRadar === "INDICADORES" && tipoNormalizado === "indicador") {
        chaveAssunto = linha.indicadorResumido;
      } else if (visaoRadar === "SUB_INDICADORES" && tipoNormalizado === "subindicador") {
        chaveAssunto = linha.indicadorResumido;
      }

      if (chaveAssunto) {
        const valorBinario = linha.violacao === 1 ? 1 : 0;
        // Se houver repetição do mesmo assunto na mesma rodada, qualquer violação prevalece
        mapa.set(chaveAssunto, Math.max(mapa.get(chaveAssunto) || 0, valorBinario));
      }
    });

    const resultadoFinal: PontoRadar[] = [];
    mapa.forEach((violacao, assunto) => {
      resultadoFinal.push({
        assunto,
        notaMaxima: 1,
        [rodadaSelecionada]: violacao,
      });
    });

    // Ordenação (Agrupamento Geométrico para Polígono Contínuo)
    // Agrupamos os valores "1" juntos para gerar uma mancha contínua, sem "picos" aleatórios
    resultadoFinal.sort((a, b) => {
      const valA = Number(a[rodadaSelecionada]) || 0;
      const valB = Number(b[rodadaSelecionada]) || 0;
      
      if (valA !== valB) {
        return valB - valA; // Valor 1 vem antes de 0
      }
      
      // Desempate alfabético se tiverem a mesma violação
      return a.assunto.toString().localeCompare(b.assunto.toString());
    });

    return resultadoFinal;
  }, [dadosBrutos, visaoRadar, rodadaSelecionada]);

  if (carregando) {
    return (
      <div className={styles.chartCard} style={{ width: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} color="#8B7355" style={{ animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.chartCard} style={{ width: "100%", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#C0272D" }}>
        <p>Erro ao carregar indicadores: {erro}</p>
      </div>
    );
  }

  if (!carregando && dadosBrutos.length === 0) {
    return (
      <div className={styles.chartCard} style={{ width: "100%", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <p style={{ color: "#8B7355", fontWeight: 600 }}>Nenhum indicador disponível</p>
        <p style={{ color: "#A89278", fontSize: 12 }}>Esta família ainda não possui dados de coleta registrados.</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {/* === VISUALIZAÇÃO: Radar Chart de Violações === */}
      <div className={styles.chartCard} style={{ zIndex: 10, width: "100%", animation: "slideFadeIn 0.3s ease" }}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitleWrapper}>
            <h3 className={styles.chartTitle}>Violações (IPM) - Área Comparativa</h3>
            <p className={styles.chartSub}>Observe a contração da vulnerabilidade sobre a família.</p>
          </div>

          <div className={styles.chartActionsPanel}>
            <div className={styles.toggleContainer}>
              <button
                className={`${styles.toggleBtn} ${visaoRadar === "INDICADORES" ? styles.active : ""}`}
                onClick={() => setVisaoRadar("INDICADORES")}
              >
                Indicadores
              </button>
              <button
                className={`${styles.toggleBtn} ${visaoRadar === "SUB_INDICADORES" ? styles.active : ""}`}
                onClick={() => setVisaoRadar("SUB_INDICADORES")}
              >
                Sub-indicadores
              </button>
            </div>

            {/* Menu Suspenso de Seleção de Rodada Única */}
            <div className={styles.dropdownSelectorWrapper} ref={dropdownRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => setDropdownAberto(!dropdownAberto)}
                title="Selecionar a rodada para visualização"
              >
                {rodadaSelecionada ? `Rodada ${rodadaSelecionada.replace("R", "")}` : "Rodadas"} <ChevronDown size={14} />
              </button>

              {dropdownAberto && (
                <div className={styles.dropdownMenu}>
                  {rodadasDisponiveis.map((rodada) => (
                    <label key={rodada} className={styles.dropdownItemLabel}>
                      <input
                        type="radio"
                        name="selecaoRodada"
                        className={styles.dropdownItemCheck}
                        checked={rodadaSelecionada === rodada}
                        onChange={() => {
                          setRodadaSelecionada(rodada);
                          setDropdownAberto(false);
                        }}
                      />
                      Rodada {rodada.replace("R", "")}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={400} minWidth={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={dadosTransformados}>
              <PolarGrid gridType="polygon" stroke="#E8D5C0" />
              <PolarAngleAxis
                dataKey="assunto"
                tick={{ fill: "#8B7355", fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1]}
                tick={false}
                axisLine={false}
              />
              <RechartsTooltip content={<TooltipRadarCustomizado />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#491B02", paddingTop: "10px" }} />

              {/* Polígono Único da Rodada Ativa */}
              {rodadaSelecionada && (
                <Radar
                  key={rodadaSelecionada}
                  name={rodadaSelecionada}
                  dataKey={rodadaSelecionada}
                  shape={<FormaRadarCustomizada />}
                  stroke={estilosRodada[rodadaSelecionada]?.stroke || "#333"}
                  fill={estilosRodada[rodadaSelecionada]?.fill || "#CCC"}
                  fillOpacity={0.5}
                  dot={false}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
