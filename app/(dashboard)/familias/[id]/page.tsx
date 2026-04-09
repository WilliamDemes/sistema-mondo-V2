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
} from "lucide-react";
import styles from "./FamiliaDetail.module.css";

type FamilyStatus = "ATIVA" | "INATIVA";
type BeneficiaryRole = "PAI" | "MAE" | "FILHO" | "FILHA" | "AVO" | "OUTRO";
interface Activity {
  id: string;
  nomeAção: string;
  descricao: string | null;
  tipo: string;
  formato: string;
  date: string;
}
interface Participation {
  id: string;
  familyId: string;
  activityId: string;
  participantCount: number;
  notes: string | null;
  activity: Activity;
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
  createdAt: string;
  beneficiarios: Beneficiary[];
  participations: Participation[];
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

  //Formulario de edição das famílias
  // Edit form
  const [eIdMondo, setEIdMondo] = useState("");
  const [eCidade, setECidade] = useState("");
  const [eEstado, setEEstado] = useState("");
  const [eGrupo, setEGrupo] = useState("");
  const [eObs, setEObs] = useState("");
  const [eStatus, setEStatus] = useState<FamilyStatus>("ATIVA");

  // Action form
  const [aActivityId, setAActivityId] = useState("");
  const [aCount, setACount] = useState("1");
  const [aNotes, setANotes] = useState("");

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
      setFamily(await res.json());
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

  async function handleActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}/participacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: aActivityId,
          participantCount: Number(aCount),
          notes: aNotes || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setShowActionModal(false);
      setAActivityId("");
      setACount("1");
      setANotes("");
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
              setAActivityId(activities[0]?.id || "");
              setShowActionModal(true);
            }}
            id="btn-registrar-acao"
          >
            <Plus size={16} />
            Registrar Ação
          </button>
        </div>
      </div>
      <h1 className={styles["hp-title"]}>{tituloFamilia}</h1>
      <p className={styles["hp-sub"]}>
        Acompanhamento e histórico de participações
      </p>

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
                  {lastP ? fmtDate(lastP.activity.date) : "---"}
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
                const isA = p.activity.tipo === "ATENDIMENTO";
                return (
                  <div key={p.id} className={styles.ti}>
                    <div className={styles.tc2}>
                      <div
                        className={styles.td}
                        style={{ background: isA ? "#6B7F3E" : "#C9943E" }}
                      />
                      {i < family.participacoes.length - 1 && (
                        <div className={styles.tln} />
                      )}
                    </div>
                    <div className={styles.tco}>
                      <div className={styles.tch}>
                        <div>
                          <span className={styles.tdt}>
                            {fmtDate(p.activity.date)}
                          </span>
                          <h3 className={styles.tt2}>{p.activity.nomeAção}</h3>
                        </div>
                        <div className={styles.tgs}>
                          <span
                            className={`${styles.tg} ${isA ? styles.tga : styles.tgv}`}
                          >
                            {isA ? "Atendimento" : "Atividade"}
                          </span>
                          <span className={`${styles.tg} ${styles.tgf}`}>
                            {p.activity.formato === "INDIVIDUAL"
                              ? "Individual"
                              : "Grupo"}
                          </span>
                        </div>
                      </div>
                      {p.activity.descricao && (
                        <p className={styles.tds}>{p.activity.descricao}</p>
                      )}
                      <div className={styles.tfo}>
                        <span className={styles.tp2}>
                          Participantes: {p.participantCount}
                        </span>
                        {p.notes && (
                          <span className={styles.tn}>Obs: {p.notes}</span>
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
            <form onSubmit={handleActionSubmit} className={styles.mfo}>
              <div className={styles.ff}>
                <label className={styles.fl}>Atividade *</label>
                <select
                  value={aActivityId}
                  onChange={(e) => setAActivityId(e.target.value)}
                  className={styles.fin}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma atividade...</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nomeAcao} (
                      {a.tipo === "ATENDIMENTO" ? "Atendimento" : "Atividade"} -{" "}
                      {fmtDate(a.date)})
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
                  value={aNotes}
                  onChange={(e) => setANotes(e.target.value)}
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
                    onChange={(e) => setMParentesco(e.target.value)}
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
