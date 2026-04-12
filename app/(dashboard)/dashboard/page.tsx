"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  Loader2,
  TrendingUp,
  MapPin,
  ClipboardList,
  Stethoscope,
  Users,
  Home,
  MessageCircle, ShoppingBag, Building, GraduationCap, Briefcase, Gift, Trophy,
  ChevronDown, ChevronUp, Printer, CheckSquare, Square
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { ALL_FAKE_DATA, type DashboardItem } from "../home/fakeData";
import ChartsClientUI from "./ChartsClientUI";

interface MonthlyData { month: string; count: number; }
interface TopFamily { id: string; name: string; territory: string; status: string; count: number; members: number; }
interface RecentActivity { id: string; title: string; type: string; format: string; date: string; description: string | null; participationCount: number; }
interface TerritoryData { name: string; families: number; active: number; }
interface DashboardStats {
  familiasAtivas: number; totalFamilias: number; moradoresAtivos: number; atendimentos: number;
  atividades: number; totalParticipacoes: number; participacaoMensal: MonthlyData[];
  topFamilias2: TopFamily[]; atividadesRecentes: RecentActivity[]; territorios: TerritoryData[];
}

const CARDS_CONFIG = [
  { label: "Participações", icon: TrendingUp, color: "#491B02" },
  { label: "Famílias Ativas", icon: Home, color: "#C0272D" },
  { label: "Moradores Ativos", icon: Users, color: "#C9943E" },
  { label: "Atendimentos", icon: Stethoscope, color: "#6B7F3E" },
  { label: "Atividades", icon: ClipboardList, color: "#009999" },
  { label: "Premiação", icon: Trophy, color: "#D4AF37" },
  { label: "Doação", icon: Gift, color: "#8E44AD" },
  { label: "Visitas Externas", icon: MapPin, color: "#E67E22" },
  { label: "Consultoria", icon: Briefcase, color: "#34495E" },
  { label: "Cursos", icon: GraduationCap, color: "#2980B9" },
  { label: "Atividades Institucionais", icon: Building, color: "#27AE60" },
  { label: "Produtos Entregues", icon: ShoppingBag, color: "#C0392B" },
  { label: "Rodas de Conversa", icon: MessageCircle, color: "#16A085" },
];

function MultiSelectDropdown({ label, options, selected, onChange }: { label: string, options: {val: string, label: string}[], selected: string[], onChange: (s: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (val: string) => onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);

  return (
    <div className={styles["custom-dropdown-wrap"]} ref={ref}>
      <label className={styles["filter-label"]}>{label}</label>
      <button className={styles["custom-dropdown-btn"]} onClick={() => setOpen(!open)}>
        {selected.length === 0 ? "Todos selecionados" : `${selected.length} selecionados`}
        <ChevronDown size={14}/>
      </button>
      {open && (
        <div className={styles["custom-dropdown-menu"]}>
          {options.map(o => (
            <div key={o.val} className={styles["custom-dropdown-item"]} onClick={() => toggle(o.val)}>
              {selected.includes(o.val) ? <CheckSquare size={14} color="#C9943E"/> : <Square size={14} color="#8B7355"/>}
              <span>{o.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [baseStats, setBaseStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros em forma de array
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  const [showAllCards, setShowAllCards] = useState(false);
  // Array para múltiplas listas suspensas (Accordions) abertas
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) setBaseStats(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    return ALL_FAKE_DATA.filter((item) => {
      const [y, m] = item.date.split("-");
      const yearMatches = selectedYears.length === 0 || selectedYears.includes(y);
      const monthMatches = selectedMonths.length === 0 || selectedMonths.includes(parseInt(m, 10).toString());
      return yearMatches && monthMatches;
    });
  }, [selectedYears, selectedMonths]);

  const stats = useMemo(() => {
    if (!baseStats) return null;
    const factorM = selectedMonths.length > 0 ? (selectedMonths.length / 12) : 1;
    const factorY = selectedYears.length > 0 ? (selectedYears.length / 4) : 1;
    const globalFactor = factorM * factorY;

    return {
      ...baseStats,
      familiasAtivas: Math.max(1, Math.floor(baseStats.familiasAtivas * globalFactor)),
      totalFamilias: Math.max(1, Math.floor(baseStats.totalFamilias * globalFactor)),
      moradoresAtivos: Math.max(1, Math.floor(baseStats.moradoresAtivos * globalFactor)),
      atendimentos: Math.max(1, Math.floor(baseStats.atendimentos * globalFactor)),
      atividades: Math.max(1, Math.floor(baseStats.atividades * globalFactor)),
      totalParticipacoes: Math.max(1, Math.floor(baseStats.totalParticipacoes * globalFactor)),
      participacaoMensal: baseStats.participacaoMensal.filter((m, i) => {
        if (selectedMonths.length === 0) return true;
        return selectedMonths.includes((i + 1).toString());
      }).map(m => ({ ...m, count: Math.max(0, Math.floor(m.count * factorY)) })),
      topFamilias2: baseStats.topFamilias2.map(f => ({ ...f, count: Math.max(1, Math.floor(f.count * globalFactor)) })),
    };
  }, [baseStats, selectedMonths, selectedYears]);

  const handleExportPDF = (categoryLabel: string, items: DashboardItem[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Habilite popups.");
    
    const rowsHTML = items.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.title}</td>
        <td>${new Date(item.date).toLocaleDateString("pt-BR")}</td>
        <td>${item.description}</td>
      </tr>
    `).join("");

    printWindow.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <title>Relatório - ${categoryLabel}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap');
          *{margin:0;padding:0;box-sizing:border-box} 
          body{font-family:'Bricolage Grotesque',sans-serif;padding:32px;color:#491B02;font-size:13px}
          h1{font-size:22px;margin-bottom:4px;color:#491B02} 
          .sub{font-size:11px;color:#8B7355;margin-bottom:24px}
          .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:3px solid #C0272D;padding-bottom:12px}
          .logo{font-size:14px;font-weight:700;color:#C0272D} 
          .date{font-size:11px;color:#8B7355}
          table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px} 
          th,td{padding:6px 10px;text-align:left;border:1px solid #E8D5C0} 
          th{background:#FDF6ED;font-weight:600;color:#491B02}
          @media print{body{padding:16px}}
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="logo">instituto mondó</span>
            <h1>Relatório de ${categoryLabel}</h1>
            <div class="sub">
              ${selectedYears.length > 0 ? "Anos: " + selectedYears.join(", ") : "Todos os Anos"} |
              ${selectedMonths.length > 0 ? "Meses: " + selectedMonths.join(", ") : "Todos os Meses"}
            </div>
          </div>
          <div class="date">Gerado em ${new Date().toLocaleDateString("pt-BR")}</div>
        </div>
        
        <h2 style="margin-bottom: 12px; font-size: 16px;">Total referenciado: ${items.length}</h2>
        <table>
          <thead>
            <tr>
              <th>ID Referência</th>
              <th>Título / Ação</th>
              <th>Data</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML.length > 0 ? rowsHTML : "<tr><td colspan='4'>Nenhum dado encontrado com os filtros atuais.</td></tr>"}
          </tbody>
        </table>
      </body>
    </html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const toggleAccordion = (label: string) => setExpandedCards(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80, flexDirection: "column", gap: 12 }}><Loader2 size={32} /></div>;
  if (!stats) return <div style={{ padding: 40, textAlign: "center", color: "#8B7355" }}>Erro ao carregar dados.</div>;

  return (
    <div className={styles.dp}>
      <div className={styles["dp-header"]}>
        <div>
          <h1 className={styles["dp-title"]}>Dashboard</h1>
          <p className={styles["dp-sub"]}>Visão geral dos indicadores do Instituto Mondó</p>
        </div>

        {/* Top Right: Custom Checkbox Dropdown Filtros */}
        <div className={styles["global-filters"]}>
          <Calendar size={18} color="#8B7355" style={{marginRight: 4}}/>
          <MultiSelectDropdown 
            label="Filtrar Ano" 
            options={[ {val:"2026", label:"2026"}, {val:"2025", label:"2025"}, {val:"2024", label:"2024"}, {val:"2023", label:"2023"} ]}
            selected={selectedYears} onChange={setSelectedYears} 
          />
          <MultiSelectDropdown 
            label="Filtrar Mês" 
            options={[ {val:"1", label:"Jan"}, {val:"2", label:"Fev"}, {val:"3", label:"Mar"}, {val:"4", label:"Abr"}, {val:"5", label:"Mai"}, {val:"6", label:"Jun"}, {val:"7", label:"Jul"}, {val:"8", label:"Ago"}, {val:"9", label:"Set"}, {val:"10", label:"Out"}, {val:"11", label:"Nov"}, {val:"12", label:"Dez"} ]}
            selected={selectedMonths} onChange={setSelectedMonths} 
          />
        </div>
      </div>

      {/* 1. Cards de Resumo Geral (NO TOPO) */}
      <div className={styles["fake-cards-section"]}>
        <div className={styles["fc-header"]}>
          <h2 className={styles["fc-title"]}>
            <Activity size={18} color="#059669" />
            Resumo Geral
          </h2>
          <button className={styles["fc-toggle"]} onClick={() => setShowAllCards(!showAllCards)}>
            {showAllCards ? "Ver Menos" : "Expandir Quadros Extras"}
            {showAllCards ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        </div>

        <div className={styles["fc-grid"]}>
          {CARDS_CONFIG.slice(0, showAllCards ? CARDS_CONFIG.length : 5).map((c) => {
            const Icon = c.icon;
            const items = filteredData.filter(d => d.category === c.label);
            const top = items.slice(0, 10);
            const isExp = expandedCards.includes(c.label);

            let derivedLength = items.length;
            if (c.label === "Participações") derivedLength = stats.totalParticipacoes;
            if (c.label === "Famílias Ativas") derivedLength = stats.familiasAtivas;
            if (c.label === "Moradores Ativos") derivedLength = stats.moradoresAtivos;
            if (c.label === "Atendimentos") derivedLength = stats.atendimentos;
            if (c.label === "Atividades") derivedLength = stats.atividades;

            return (
              <div key={c.label} className={styles["fc-card"]} style={{borderLeftColor: c.color}}>
                <div className={styles["fc-card-top"]}>
                  <div className={styles["fc-icon"]} style={{background: `${c.color}15`, color: c.color}}><Icon size={16} /></div>
                  <span className={styles["fc-val"]}>{derivedLength}</span>
                </div>
                <span className={styles["fc-label"]}>{c.label}</span>
                
                <button className={styles["fc-accordion-toggle"]} onClick={() => toggleAccordion(c.label)}>
                  Visualizar Histórico {isExp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>

                {isExp && (
                  <div className={styles["fc-list"]}>
                    {top.map(t => (
                      <div key={t.id} className={styles["fc-item"]}>
                        <div className={styles["fc-item-t"]}>{t.title}</div>
                        <div className={styles["fc-item-d"]}>{new Date(t.date).toLocaleDateString("pt-BR")}</div>
                      </div>
                    ))}
                    {top.length === 0 && <span style={{fontSize:11, color:'#8B7355'}}>Gere interações reais para popular...</span>}
                    <button className={styles["export-btn"]} onClick={() => handleExportPDF(c.label, items)}>
                      <Printer size={12}/> Gerar PDF ({items.length})
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Gráficos Institucionais Recharts (AGORA ABAIXO DOS CARDS) */}
      <ChartsClientUI stats={stats} filteredFakeData={filteredData} />

    </div>
  );
}
