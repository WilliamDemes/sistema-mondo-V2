"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  MapPin,
  Home,
  Calendar,
  Hash,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  CalendarDays,
  FileText,
  TrendingUp,
  Radar,
  LineChart,
  Globe,
  HeartPulse,
  GraduationCap,
  Wrench,
  Briefcase,
  Apple,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./FamiliaDetail.module.css";
import { FamilyAnalyticsCharts } from "./FamilyAnalyticsCharts";
import { FamilyHistoryChart } from "./FamilyHistoryChart";
import dynamic from 'next/dynamic';

const FamilyLocationMap = dynamic(
  () => import('./FamilyLocationMap'),
  { 
    ssr: false, 
    loading: () => <div style={{ height: '400px', backgroundColor: '#FEFBF7', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B7355', border: '1px solid #E8D5C0' }}>Carregando Satélite Logístico...</div> 
  }
);

type FamilyStatus = "ATIVA" | "INATIVA";
type BeneficiaryRole = "PAI" | "MAE" | "FILHO" | "FILHA" | "AVO" | "OUTRO";
interface Activity {
  idAcao: string;
  nomeAcao: string;
  descricao: string | null;
  dimensao: string;
  categoria: string;
  formato: string;
  data: string;
}
interface Participacoes {
  id: string;
  idFamilia: string;
  idAcao: string;
  contagemParticipantes: number;
  observacoes: string | null;
  acoes: Activity;
}
interface Beneficiary {
  id: string;
  familyId: string;
  nome: string;
  idade: number;
  parentesco: string;
  responsavel: string;
  sexo: string;
}
interface FamilyDetail {
  id: string;
  idMondoFamilia: string;
  cidade: string;
  estado: string;
  grupoReferencia: string;
  status: FamilyStatus;
  observacao: string | null;
  criadoEm: string;
  beneficiarios: Beneficiary[];
  participacoes: Participacoes[];
  
  // Novos indicadores frontend mockados
  engajamento?: "Alto" | "Médio" | "Baixo";
  autonomia?: "Alto" | "Médio" | "Baixo";
  foto?: string;
}
interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

const roleLabels: Record<string, string> = {
  PAI: "Pai",
  MAE: "Mãe",
  FILHO: "Filho",
  FILHA: "Filha",
  AVO: "Avó/Avô",
  OUTRO: "Outro",
};

// --- Mapeamento de Dimensões para a Timeline ---
interface DimensionStyle {
  icon: LucideIcon;
  color: string;
  bgLight: string;
  label: string;
}

const DIMENSION_MAP: Record<string, DimensionStyle> = {
  "SAUDE":       { icon: HeartPulse,    color: "#C0272D", bgLight: "rgba(192, 39, 45, 0.08)",  label: "Saúde" },
  "EDUCACAO":    { icon: GraduationCap,  color: "#2D6A4F", bgLight: "rgba(45, 106, 79, 0.08)",  label: "Educação" },
  "MAE":         { icon: Wrench,         color: "#6C5B7B", bgLight: "rgba(108, 91, 123, 0.08)", label: "Moradia/Água/Energia" },
  "DESENVOLVIMENTO_ECONOMICO": { icon: Briefcase, color: "#C9943E", bgLight: "rgba(201, 148, 62, 0.08)",  label: "Des. Econômico" },
  "NUTRICAO":    { icon: Apple,          color: "#6B7F3E", bgLight: "rgba(107, 127, 62, 0.08)",  label: "Nutrição" },
};
const DEFAULT_DIMENSION: DimensionStyle = { icon: HelpCircle, color: "#8B7355", bgLight: "rgba(139, 115, 85, 0.08)", label: "Geral" };

// Busca a dimensão diretamente do campo do banco de dados
function getDimensionStyle(dimensao: string | undefined | null): DimensionStyle {
  if (!dimensao) return DEFAULT_DIMENSION;
  return DIMENSION_MAP[dimensao] || DEFAULT_DIMENSION;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FamilyHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  //Controle de Modais
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle do Carrossel Visual
  const [activeCarouselTab, setActiveCarouselTab] = useState<"MAPA" | "RADAR" | "LINHA">("RADAR");

  //Formulario de edição das famílias
  // Edit form
  const [eIdMondo, setEIdMondo] = useState("");
  const [eCidade, setECidade] = useState("");
  const [eEstado, setEEstado] = useState("");
  const [eGrupo, setEGrupo] = useState("");
  const [eObs, setEObs] = useState("");
  const [eStatus, setEStatus] = useState<FamilyStatus>("ATIVA");

  // Action form
  const [aacaoId, setAacaoId] = useState("");
  const [aCount, setACount] = useState("1");
  const [aObservacoes, setAObservacoes] = useState("");

  // Member form
  const [mNome, setMNome] = useState("");
  const [mIdade, setMIdade] = useState("");
  const [mParentesco, setMParentesco] = useState<BeneficiaryRole>("FILHO");
  const [mSexo, setMSexo] = useState("Masculino");
  const [mResponsavel, setMResponsavel] = useState("Não");

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const tid = Date.now();
    setToasts((p) => [...p, { id: tid, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== tid)), 4000);
  }, []);

  const fetchFamily = useCallback(async () => {
    try {
      const res = await fetch(`/api/familias/${id}`);
      if (!res.ok) throw new Error();
      const f = await res.json();
      
      const fotosMock = [
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=250&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=250&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484665754804-74b091211472?q=80&w=250&auto=format&fit=crop"
      ];
      const niveis = ["Alto", "Médio", "Baixo"] as const;
      const hash = f.idMondoFamilia ? f.idMondoFamilia.charCodeAt(0) + f.idMondoFamilia.length : 0;
      
      setFamily({
        ...f,
        engajamento: niveis[(hash) % 3],
        autonomia: niveis[(hash + 1) % 3],
        foto: fotosMock[hash % fotosMock.length]
      });
    } catch {
      addToast("error", "Erro ao carregar família.");
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/atividades?limite=50");
      if (res.ok) {
        const data = await res.json();
        // Abrimos a gaveta certa da nossa caixa organizadora!
        const listaSegura = data.activities || data.atividadesDaPagina || [];
        setActivities(listaSegura);
      }
    } catch (err) {
      console.error("Erro ao buscar atividades para o select:", err);
    }
  }, []);

  useEffect(() => {
    fetchFamily();
    fetchActivities();
  }, [fetchFamily, fetchActivities]);

  function openEditModal() {
    if (!family) return;
    setEIdMondo(family.idMondoFamilia);
    setECidade(family.cidade);
    setEEstado(family.estado);
    setEGrupo(family.grupoReferencia);
    setEObs(family.observacao || "");
    setEStatus(family.status);
    setShowEditModal(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idMondoFamilia: eIdMondo,
          cidade: eCidade,
          estado: eEstado,
          grupoReferencia: eGrupo,
          observacao: eObs || null,
          status: eStatus,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setFamily((f) => (f ? { ...f, ...updated } : f));
      setShowEditModal(false);
      addToast("success", "Família atualizada com sucesso!");
    } catch {
      addToast("error", "Erro ao atualizar família.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registrarAcao(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}/participacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acaoId: aacaoId,
          contagemParticipantes: Number(aCount),
          observacoes: aObservacoes || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setShowActionModal(false);
      setAacaoId("");
      setACount("1");
      setAObservacoes("");
      addToast("success", "Ação registrada com sucesso!");
      await fetchFamily();
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Erro ao registrar ação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMemberSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}/beneficiarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: mNome,
          idade: Number(mIdade),
          parentesco: mParentesco,
          sexo: mSexo,
          responsavel: mResponsavel,
          cor: "NAO_COLETADO",
          idMondoMorador: `${family?.idMondoFamilia}.X`,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setFamily((f) =>
        f ? { ...f, beneficiarios: [...f.beneficiarios, created] } : f,
      );
      setShowMemberModal(false);
      setMNome("");
      setMIdade("");
      setMParentesco("FILHO");
      addToast("success", `Integrante "${created.name}" adicionado!`);
    } catch {
      addToast("error", "Erro ao adicionar integrante.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          color: "#8B7355",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Loader2 size={32} className="spinner" />
        <p>Carregando família...</p>
        <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  if (!family)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Família não encontrada</h2>
        <Link href="/familias">Voltar</Link>
      </div>
    );

  const lastP = family.participacoes[0];

  // 1. Descobre quem é o responsável
  const resp = family.beneficiarios.find((b) => b.responsavel === "Sim");

  // 2. Lógica para extrair os dois últimos nomes
  let sobrenomeFamilia = "";
  if (resp && resp.nome) {
    // Quebra o nome completo em uma lista de palavras (Ex: ["Arlene", "do", "Socorro", "Brandao", "Vanzeler"])
    const partesDoNome = resp.nome.trim().split(" ");

    // Se a pessoa tiver 2 ou mais nomes, pegamos os 2 últimos. Se tiver só 1, pegamos ele mesmo.
    sobrenomeFamilia =
      partesDoNome.length >= 2
        ? partesDoNome.slice(-2).join(" ") // Pega de trás para frente os 2 últimos e junta com espaço
        : partesDoNome[0];
  }

  // 3. Monta o título final
  const tituloFamilia = resp
    ? `${family.idMondoFamilia} - ${sobrenomeFamilia}`
    : `Família #${family.idMondoFamilia}`;

  return (
    <div className={styles.hp}>
      <div className={styles["toast-c"]}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[`t-${t.type}`]}`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{t.message}</span>
            <button
              className={styles["toast-x"]}
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles["hp-head"]}>
        <Link href="/familias" className={styles["hp-back"]}>
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <div className={styles["hp-acts"]}>
          <button
            className={styles["hp-btn-out"]}
            onClick={openEditModal}
            id="btn-editar-familia"
          >
            <Edit3 size={16} />
            Editar Família
          </button>
          <button
            className={styles["hp-btn-pri"]}
            onClick={() => {
              setAacaoId(activities[0]?.idAcao || "");
              setShowActionModal(true);
            }}
            id="btn-registrar-acao"
          >
            <Plus size={16} />
            Registrar Ação
          </button>
        </div>
      </div>
      <div className={styles["hp-profile"]}>
        <div className={styles["hp-profile-photo"]}>
          <img src={family.foto} alt="Família" />
        </div>
        <div className={styles["hp-profile-info"]}>
          <h1 className={styles["hp-title"]}>
            {tituloFamilia}
          </h1>
          <div className={styles["hp-badges"]}>
            <span className={`${styles["hp-pill"]} ${family.status === "ATIVA" ? styles["st-ativa"] : styles["st-inativa"]}`}>
              {family.status === "ATIVA" ? "Ativa" : "Inativa"}
            </span>
            <span className={`${styles["hp-pill"]} ${family.engajamento === "Alto" ? styles["st-eng-alto"] : family.engajamento === "Médio" ? styles["st-eng-med"] : styles["st-eng-baixo"]}`}>
              Engajamento {family.engajamento}
            </span>
            <span className={`${styles["hp-pill"]} ${family.autonomia === "Alto" ? styles["st-aut-alta"] : family.autonomia === "Médio" ? styles["st-aut-med"] : styles["st-aut-baixa"]}`}>
              Autonomia {family.autonomia}
            </span>
          </div>
          <p className={styles["hp-sub"]}>Acompanhamento e histórico de participações</p>
        </div>
      </div>


      <div className={styles["hp-grid"]}>
        <div className={styles["hp-left"]}>
          {/* Summary */}
          <section className={styles.hc}>
            <div className={styles["hc-h"]}>
              <h2 className={styles["hc-t"]}>Resumo</h2>
              <span
                className={`${styles.sb} ${family.status === "ATIVA" ? styles.sa : styles.si}`}
              >
                {family.status === "ATIVA" ? "Ativa" : "Inativa"}
              </span>
            </div>
            <div className={styles.sg}>
              <div className={styles.si2}>
                <div className={styles.sil}>
                  <MapPin size={14} />
                  Território
                </div>
                <span className={styles.siv}>
                  {family.cidade} - {family.estado}{" "}
                </span>
              </div>
              <div className={styles.si2}>
                <div className={styles.sil}>
                  <Home size={14} />
                  Endereço
                </div>
                <span className={styles.siv}>{family.grupoReferencia}</span>
              </div>
              <div className={styles.si2}>
                <div className={styles.sil}>
                  <Calendar size={14} />
                  Último registro
                </div>
                <span className={styles.siv}>
                  {lastP ? fmtDate(lastP.acoes.data) : "---"}
                </span>
              </div>
              <div className={styles.si2}>
                <div className={styles.sil}>
                  <Hash size={14} />
                  Total de participações
                </div>
                <span className={`${styles.siv} ${styles.svh}`}>
                  {family.participacoes.length}
                </span>
              </div>
            </div>
          </section>

          {/* === CARROSSSEL DE MÓDULOS (MAPA/RADAR/LINHA) === */}
          <div className={styles.carouselContainer}>
            <div className={styles.carouselToggle}>
              <button 
                className={`${styles.carouselBtn} ${activeCarouselTab === "RADAR" ? styles.active : ""}`}
                onClick={() => setActiveCarouselTab("RADAR")}
              >
                <Radar size={15} /> Violações
              </button>
              <button 
                className={`${styles.carouselBtn} ${activeCarouselTab === "LINHA" ? styles.active : ""}`}
                onClick={() => setActiveCarouselTab("LINHA")}
              >
                <LineChart size={15} /> Histórico
              </button>
              <button 
                className={`${styles.carouselBtn} ${activeCarouselTab === "MAPA" ? styles.active : ""}`}
                onClick={() => setActiveCarouselTab("MAPA")}
              >
                <Globe size={15} /> Satélite
              </button>
            </div>

            <div className={styles.carouselContent} key={activeCarouselTab}>
              {activeCarouselTab === "RADAR" && (
                 <FamilyAnalyticsCharts familyId={id} />
              )}
              {activeCarouselTab === "LINHA" && (
                 <FamilyHistoryChart />
              )}
              {activeCarouselTab === "MAPA" && (
                <FamilyLocationMap 
                  lat={-1.45502} 
                  lng={-48.49018} 
                  familyName={sobrenomeFamilia || "Não listado"} 
                />
              )}
            </div>
          </div>
          {/* ============================================== */}

          {/* Timeline */}
          <section className={styles.hc}>
            <div className={styles["hc-h"]}>
              <h2 className={styles["hc-t"]}>Linha do Tempo</h2>
              <span className={styles.th}>
                Total: {family.participacoes.length}
              </span>
            </div>
            <div className={styles.tl}>
              {family.participacoes.map((p, i) => {
                const dim = getDimensionStyle(p.acoes.dimensao);
                const DimIcon = dim.icon;
                return (
                  <div key={p.id} className={styles.ti}>
                    <div className={styles.tc2}>
                      <div
                        className={styles.td}
                        style={{ 
                          background: dim.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          boxShadow: `0 0 0 3px #FFF, 0 0 0 4px ${dim.color}30`
                        }}
                      >
                        <DimIcon size={14} color="#FFF" />
                      </div>
                      {i < family.participacoes.length - 1 && (
                        <div className={styles.tln} style={{ background: `${dim.color}30` }} />
                      )}
                    </div>
                    <div className={styles.tco} style={{ borderLeft: `3px solid ${dim.color}` }}>
                      <div className={styles.tch}>
                        <div>
                          <span className={styles.tdt}>
                            {fmtDate(p.acoes.data)}
                          </span>
                          <h3 className={styles.tt2}>{p.acoes.nomeAcao}</h3>
                        </div>
                        <div className={styles.tgs}>
                          <span
                            className={styles.tg}
                            style={{ color: dim.color, borderColor: dim.color, background: dim.bgLight }}
                          >
                            {dim.label}
                          </span>
                          <span className={`${styles.tg} ${styles.tgf}`}>
                            {p.acoes.formato === "INDIVIDUAL"
                              ? "Individual"
                              : "Grupo"}
                          </span>
                        </div>
                      </div>
                      {p.acoes.descricao && (
                        <p className={styles.tds}>{p.acoes.descricao}</p>
                      )}
                      <div className={styles.tfo}>
                        <span className={styles.tp2}>
                          Participantes: {p.contagemParticipantes}
                        </span>
                        {p.observacoes && (
                          <span className={styles.tn}>Obs: {p.observacoes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {family.participacoes.length === 0 && (
                <div className={styles.te}>
                  <p>Nenhuma participação registrada.</p>
                  <button
                    className={styles["te-btn"]}
                    onClick={() => setShowActionModal(true)}
                  >
                    <Plus size={14} />
                    Registrar primeira ação
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className={styles["hp-right"]}>
          {/* Members */}
          <section className={styles.hc}>
            <div className={styles["hc-h"]}>
              <h2 className={styles["hc-t"]}>Integrantes</h2>
              <button
                className={styles.bp}
                onClick={() => setShowMemberModal(true)}
                id="btn-add-integrante"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
            <div className={styles.ml}>
              {family.beneficiarios.map((m) => (
                <div key={m.id} className={styles.mi}>
                  <div
                    className={styles.ma}
                    style={{
                      background:
                        m.responsavel === "Sim"
                          ? "linear-gradient(135deg,#C0272D,#D4444A)"
                          : "linear-gradient(135deg,#6B7F3E,#7A9147)",
                    }}
                  >
                    {m.nome.charAt(0)}
                  </div>
                  <div className={styles.mf}>
                    <span className={styles.mn}>
                      {m.nome} {m.responsavel === "Sim" ? "⭐" : ""}
                    </span>
                    <span className={styles.md}>
                      {m.idade} anos • {m.parentesco}{" "}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className={`${styles.hc} ${styles.ho}`}>
            <h2 className={styles["hc-t"]}>Observações</h2>
            <p className={styles.ot}>
              {family.observacao || "Nenhuma observação registrada."}
            </p>
          </section>
        </div>
      </div>

      {/* Edit Family Modal */}
      {showEditModal && (
        <div
          className={styles.mov}
          onClick={() => !isSubmitting && setShowEditModal(false)}
        >
          <div className={styles.mc} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mh}>
              <h2>Editar Família</h2>
              <button
                className={styles.mx}
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.mfo}>
              <div className={styles.ff}>
                <label className={styles.fl}>ID Mondó *</label>
                <input
                  value={eIdMondo}
                  onChange={(e) => setEIdMondo(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Cidade *</label>
                <input
                  value={eCidade}
                  onChange={(e) => setECidade(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Estado *</label>
                <input
                  value={eEstado}
                  onChange={(e) => setEEstado(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Grupo de Referência *</label>
                <select
                  value={eGrupo}
                  onChange={(e) => setEGrupo(e.target.value)}
                  className={styles.fin}
                  disabled={isSubmitting}
                >
                  <option value="MONDO">Instituto Mondó</option>
                  <option value="APAE">APAE</option>
                  <option value="PARTEIRA">Parteira</option>
                  <option value="SEMTRAS">SEMTRAS</option>
                  <option value="SAO_TOME">São Tomé</option>
                </select>
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Status</label>
                <select
                  value={eStatus}
                  onChange={(e) => setEStatus(e.target.value as FamilyStatus)}
                  className={styles.fin}
                  disabled={isSubmitting}
                >
                  <option value="ATIVA">ATIVA</option>
                  <option value="INATIVA">INATIVA</option>
                </select>
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Observações</label>
                <textarea
                  value={eObs}
                  onChange={(e) => setEObs(e.target.value)}
                  className={styles.fta}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.fac}>
                <button
                  type="button"
                  className={styles.bc}
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.bs}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.bl}>
                      <Loader2 size={16} className="spinner" />
                      <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Salvando...
                    </span>
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Action Modal */}
      {showActionModal && (
        <div
          className={styles.mov}
          onClick={() => !isSubmitting && setShowActionModal(false)}
        >
          <div className={styles.mc} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mh}>
              <h2>Registrar Ação</h2>
              <button
                className={styles.mx}
                onClick={() => setShowActionModal(false)}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={registrarAcao} className={styles.mfo}>
              <div className={styles.ff}>
                <label className={styles.fl}>Atividade *</label>
                <select
                  value={aacaoId}
                  onChange={(e) => setAacaoId(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma atividade...</option>
                  {activities.map((a) => (
                    <option key={a.idAcao} value={a.idAcao}>
                      {a.nomeAcao} (
                      {a.categoria === "ATENDIMENTO" ? "Atendimento" : "Atividade"} -{" "}
                      {fmtDate(a.data)})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Nº de Participantes *</label>
                <input
                  type="number"
                  min="1"
                  value={aCount}
                  onChange={(e) => setACount(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Observações</label>
                <textarea
                  value={aObservacoes}
                  onChange={(e) => setAObservacoes(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className={styles.fta}
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.fac}>
                <button
                  type="button"
                  className={styles.bc}
                  onClick={() => setShowActionModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.bs}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.bl}>
                      <Loader2 size={16} className="spinner" />
                      <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Registrando...
                    </span>
                  ) : (
                    "Registrar Ação"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div
          className={styles.mov}
          onClick={() => !isSubmitting && setShowMemberModal(false)}
        >
          <div className={styles.mc} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mh}>
              <h2>Adicionar Integrante</h2>
              <button
                className={styles.mx}
                onClick={() => setShowMemberModal(false)}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMemberSubmit} className={styles.mfo}>
              <div className={styles.ff}>
                <label className={styles.fl}>Nome *</label>
                <input
                  value={mNome}
                  onChange={(e) => setMNome(e.target.value)}
                  placeholder="Nome completo"
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className={styles.fr2}>
                <div className={styles.ff}>
                  <label className={styles.fl}>Idade *</label>
                  <input
                    type="number"
                    min="0"
                    value={mIdade}
                    onChange={(e) => setMIdade(e.target.value)}
                    className={styles.fin}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.ff}>
                  <label className={styles.fl}>Sexo *</label>
                  <select
                    value={mSexo}
                    onChange={(e) => setMSexo(e.target.value)}
                    className={styles.fin}
                    disabled={isSubmitting}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro_ou_Não_declarou">
                      Outro/Não Declarou
                    </option>
                  </select>
                </div>
                <div className={styles.ff}>
                  <label className={styles.fl}>Parentesco *</label>
                  <select
                    value={mParentesco}
                    onChange={(e) => setMParentesco(e.target.value as BeneficiaryRole)}
                    className={styles.fin}
                    disabled={isSubmitting}
                  >
                    <option value="FILHO">Filho</option>
                    <option value="MAE">Mãe</option>
                    <option value="PAI">Pai</option>
                    <option value="AVO">Avó/Avô</option>
                    <option value="CONJUGE">Cônjuge</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className={styles.ff}>
                  <label className={styles.fl}>É Responsável?</label>
                  <select
                    value={mResponsavel}
                    onChange={(e) => setMResponsavel(e.target.value)}
                    className={styles.fin}
                    disabled={isSubmitting}
                  >
                    <option value="Nao">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
              </div>
              <div className={styles.fac}>
                <button
                  type="button"
                  className={styles.bc}
                  onClick={() => setShowMemberModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.bs}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.bl}>
                      <Loader2 size={16} className="spinner" />
                      <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Adicionando...
                    </span>
                  ) : (
                    "Adicionar Integrante"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
