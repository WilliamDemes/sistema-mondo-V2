"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Users,
  Stethoscope,
  ClipboardList,
  Eye,
  Edit3,
  Trash2,
  X,
  Filter,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import styles from "./Atividades.module.css";

// Opções da interface
type TipoAtividade = "ATENDIMENTO" | "ATIVIDADE";
type FormatoAtividade = "INDIVIDUAL" | "GRUPO";
type Dimensao =
  | "EDUCACAO"
  | "SAUDE"
  | "MAE"
  | "DESENVOLVIMENTO_ECONOMICO"
  | "NUTRICAO";
type Projeto = "REDEMAIS" | "PROA";

interface Activity {
  id: string;
  nomeAcao: string;
  descricao: string | null;
  dimensao: Dimensao;
  projeto: Projeto;
  tipo: TipoAtividade;
  formato: FormatoAtividade;
  local: string;
  semestre: string;
  date: string;
  createdAt: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ─── Helpers ───
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AtividadesPage() {
  // Memória da página de atividades
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"TODOS" | TipoAtividade>("TODOS");
  const [filterFormat, setFilterFormat] = useState<"TODOS" | FormatoAtividade>("TODOS");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // novas memórias de paginação e totais
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalApenasAtividades, setTotalApenasAtividades] = useState(0);
  const [totalApenasAtendimentos, setTotalApenasAtendimentos] = useState(0);

  // Form state, memória da página
  const [formNomeAcao, setFormNomeAcao] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formDimensao, setFormDimensao] = useState<Dimensao>("EDUCACAO");
  const [formProjeto, setFormProjeto] = useState<Projeto>("REDEMAIS");
  const [formTipoAtividade, setFormTipoAtividade] = useState<TipoAtividade>("ATIVIDADE");
  const [formFormatoAtividade, setFormFormatoAtividade] = useState<FormatoAtividade>("GRUPO");
  const [formLocal, setFormLocal] = useState("");
  const [formSemestre, setFormSemestre] = useState("");
  const [formDate, setFormDate] = useState("");

  // ─── Toast system ───
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // ─── Fetch activities from API ───
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/atividades?busca=${searchTerm}&pagina=${paginaAtual}`);
      if (!res.ok) throw new Error("Erro ao carregar atividades");
      
      const data = await res.json();
      
      // BLINDAGEM: Lemos activities (novo) ou atividadesDaPagina (original do backend)
      // O || [] garante que se falhar, fica uma lista vazia e não quebra a tela!
      const listaSegura = data.activities || data.atividadesDaPagina || [];
      setActivities(listaSegura);
      
      setTotalPaginas(data.totalPaginas || 1);
      
      // Aplicamos a mesma blindagem para os contadores, garantindo que sejam sempre números
      setTotalAtividades(data.totalAtividades || data.totalGeralEncontrado || 0);
      setTotalApenasAtividades(data.contagemAtividades || 0);
      setTotalApenasAtendimentos(data.contagemAtendimentos || 0);

    } catch (err) {
      console.error(err);
      addToast("error", "Erro ao carregar atividades do servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [addToast, searchTerm, paginaAtual]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ─── Filtered & sorted ───
  const filteredActivities = activities.filter((a) => {
    const nomeSeguro = a.nomeAcao || (a as any).title || "";
    const descricaoSegura = a.descricao || (a as any).description || "";
    const termo = searchTerm.toLowerCase();

    const matchSearch =
      nomeSeguro.toLowerCase().includes(termo) ||
      descricaoSegura.toLowerCase().includes(termo);

    const matchType = filterType === "TODOS" || a.tipo === filterType;
    const matchFormat = filterFormat === "TODOS" || a.formato === filterFormat;

    return matchSearch && matchType && matchFormat;
  });

  // ─── Stats ───
  // Agora os cálculos são automáticos usando os dados cravados do banco de dados
  const todasAtividades = totalApenasAtividades;
  const totalAtendimentos = totalApenasAtendimentos;
  const totalTotal = totalAtividades;

  // ─── Open new modal ───
  function handleOpenNew() {
    setEditingActivity(null);
    setFormNomeAcao("");
    setFormDescricao("");
    setFormDimensao("EDUCACAO");
    setFormProjeto("REDEMAIS");
    setFormTipoAtividade("ATIVIDADE");
    setFormFormatoAtividade("GRUPO");
    setFormLocal("");
    setFormSemestre("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  }

  // ─── Open edit modal ───
  function handleOpenEdit(activity: Activity) {
    setEditingActivity(activity);
    setFormNomeAcao(activity.nomeAcao);
    setFormDescricao(activity.descricao || "");
    setFormDimensao(activity.dimensao);
    setFormProjeto(activity.projeto);
    setFormTipoAtividade(activity.tipo);
    setFormFormatoAtividade(activity.formato);
    setFormLocal(activity.local);
    setFormSemestre(activity.semestre);
    setFormDate(activity.date);
    setShowModal(true);
  }

  // Preparando o pacote de dados para mandar para a api
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        nomeAcao: formNomeAcao,
        descricao: formDescricao || null,
        dimensao: formDimensao,
        projeto: formProjeto,
        tipo: formTipoAtividade,
        formato: formFormatoAtividade,
        local: formLocal,
        semestre: formSemestre,
        date: formDate,
      };

      if (editingActivity) {
        // PUT - atualizar
        const res = await fetch(`/api/atividades/${editingActivity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erro ao atualizar atividade");

        const updated: Activity = await res.json();
        setActivities((prev) =>
          prev
            .map((a) => (a.id === updated.id ? updated : a))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
        );
        addToast("success", `Atividade "${updated.nomeAcao}" atualizada com sucesso!`);
      } else {
        // POST - criar
        const res = await fetch("/api/atividades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro ao criar atividade");
        }

        const created: Activity = await res.json();
        setActivities((prev) =>
          [...prev, created].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
        
        // Atualiza a paginação e força a voltar para a página 1 ao criar
        setPaginaAtual(1);
        fetchActivities();

        addToast("success", `Atividade "${created.nomeAcao}" cadastrada com sucesso!`);
      }

      setShowModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      addToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // DELETANDO ATIVIDADE
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/atividades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir atividade");

      setActivities((prev) => prev.filter((a) => a.id !== id));
      setShowDeleteConfirm(null);
      
      // Atualiza os dados da tela após deletar
      fetchActivities();

      addToast("success", "Atividade excluída com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir";
      addToast("error", message);
    }
  }

  // ─── View detail ───
  function handleViewDetail(activity: Activity) {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  }

  return (
    <div className={styles["atividades-page"]}>
      {/* Toast Notifications */}
      <div className={styles["toast-container"]} id="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[`toast-${toast.type}`]}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.message}</span>
            <button
              className={styles["toast-close"]}
              onClick={() =>
                setToasts((p) => p.filter((t) => t.id !== toast.id))
              }
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={styles["atividades-header"]}>
        <div>
          <h1 className={styles["atividades-title"]}>Atividades</h1>
          <p className={styles["atividades-subtitle"]}>
            Cadastre e gerencie atividades e atendimentos para os beneficiários
          </p>
        </div>
        <button
          className={styles["btn-new-activity"]}
          onClick={handleOpenNew}
          id="btn-nova-atividade"
        >
          <Plus size={16} />
          Nova Atividade
        </button>
      </div>

      {/* Stats */}
      <div className={styles["atividades-stats"]} id="atividades-stats">
        <div
          className={styles["stat-mini"]}
          style={{ borderLeftColor: "#009999" }}
        >
          <div
            className={styles["stat-mini-icon"]}
            style={{ color: "#009999", background: "#00999912" }}
          >
            <ClipboardList size={18} />
          </div>
          <div className={styles["stat-mini-content"]}>
            <span className={styles["stat-mini-value"]}>{todasAtividades}</span>
            <span className={styles["stat-mini-label"]}>Atividades</span>
          </div>
        </div>
        <div
          className={styles["stat-mini"]}
          style={{ borderLeftColor: "#6B7F3E" }}
        >
          <div
            className={styles["stat-mini-icon"]}
            style={{ color: "#6B7F3E", background: "#6B7F3E12" }}
          >
            <Stethoscope size={18} />
          </div>
          <div className={styles["stat-mini-content"]}>
            <span className={styles["stat-mini-value"]}>
              {totalAtendimentos}
            </span>
            <span className={styles["stat-mini-label"]}>Atendimentos</span>
          </div>
        </div>
        <div
          className={styles["stat-mini"]}
          style={{ borderLeftColor: "#C9943E" }}
        >
          <div
            className={styles["stat-mini-icon"]}
            style={{ color: "#C9943E", background: "#C9943E12" }}
          >
            <Users size={18} />
          </div>
          <div className={styles["stat-mini-content"]}>
            <span className={styles["stat-mini-value"]}>{totalTotal}</span>
            <span className={styles["stat-mini-label"]}>Total Cadastros</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles["atividades-filters"]} id="atividades-filters">
        <div className={styles["filter-search-wrapper"]}>
          <Search size={16} className={styles["filter-search-icon"]} />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles["filter-search-input"]}
            id="filter-search-atividade"
          />
        </div>
        <div className={styles["filter-selects"]}>
          <div className={styles["filter-select-group"]}>
            <Filter size={14} />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "TODOS" | TipoAtividade)
              }
              className={styles["filter-select"]}
              id="filter-tipo-atividade"
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="ATENDIMENTO">Atendimento</option>
              <option value="ATIVIDADE">Atividade</option>
            </select>
          </div>
          <div className={styles["filter-select-group"]}>
            <User size={14} />
            <select
              value={filterFormat}
              onChange={(e) =>
                setFilterFormat(e.target.value as "TODOS" | FormatoAtividade)
              }
              className={styles["filter-select"]}
              id="filter-formato-atividade"
            >
              <option value="TODOS">Todos os formatos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="GRUPO">Grupo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={styles["atividades-loading"]}>
          <Loader2 size={32} className="spinner" />
          <p>Carregando atividades...</p>
        </div>
      )}

      {/* Activity List */}
      {!isLoading && (
        <div className={styles["atividades-list"]} id="atividades-list">
          {filteredActivities.map((activity) => {
            const isAtendimento = activity.tipo === "ATENDIMENTO";
            return (
              <div
                key={activity.id}
                className={styles["activity-card"]}
                id={`activity-${activity.id}`}
              >
                <div className={styles["activity-card-left"]}>
                  <div
                    className={styles["activity-card-indicator"]}
                    style={{
                      background: isAtendimento ? "#6B7F3E" : "#009999",
                    }}
                  />
                  <div className={styles["activity-card-content"]}>
                    <div className={styles["activity-card-top"]}>
                      <h3 className={styles["activity-card-title"]}>
                        {activity.nomeAcao}
                      </h3>
                      <div className={styles["activity-card-tags"]}>
                        <span
                          className={`${styles["activity-tag"]} ${isAtendimento ? styles["tag-atendimento"] : styles["tag-atividade"]}`}
                        >
                          {isAtendimento ? "Atendimento" : "Atividade"}
                        </span>
                        <span
                          className={`${styles["activity-tag"]} ${styles["tag-format"]}`}
                        >
                          {activity.formato === "INDIVIDUAL"
                            ? "Individual"
                            : "Grupo"}
                        </span>
                      </div>
                    </div>
                    {activity.descricao && (
                      <p className={styles["activity-card-description"]}>
                        {activity.descricao}
                      </p>
                    )}
                    <div className={styles["activity-card-meta"]}>
                      <span className={styles["activity-meta-item"]}>
                        <CalendarDays size={14} />
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles["activity-card-actions"]}>
                  <button
                    className={`${styles["activity-action-btn"]} ${styles["activity-action-view"]}`}
                    onClick={() => handleViewDetail(activity)}
                    title="Ver detalhes"
                    id={`btn-ver-activity-${activity.id}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={`${styles["activity-action-btn"]} ${styles["activity-action-edit"]}`}
                    onClick={() => handleOpenEdit(activity)}
                    title="Editar"
                    id={`btn-edit-activity-${activity.id}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className={`${styles["activity-action-btn"]} ${styles["activity-action-delete"]}`}
                    onClick={() => setShowDeleteConfirm(activity.id)}
                    title="Excluir"
                    id={`btn-delete-activity-${activity.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {showDeleteConfirm === activity.id && (
                  <div className={styles["delete-confirm-overlay"]}>
                    <div className={styles["delete-confirm-content"]}>
                      <p>
                        Excluir <strong>{activity.nomeAcao}</strong>?
                      </p>
                      <div className={styles["delete-confirm-actions"]}>
                        <button
                          className={styles["btn-cancel-sm"]}
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          className={styles["btn-delete-confirm"]}
                          onClick={() => handleDelete(activity.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredActivities.length === 0 && !isLoading && (
            <div className={styles["atividades-empty"]}>
              <ClipboardList size={40} />
              <p>Nenhuma atividade encontrada.</p>
              <button
                className={styles["btn-new-activity-empty"]}
                onClick={handleOpenNew}
              >
                <Plus size={16} />
                Cadastrar Nova Atividade
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- INÍCIO DA PAGINAÇÃO --- */}
      {!isLoading && totalPaginas > 1 && (
        <div className={styles["pagination-container"]} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          
          <button 
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            className={styles["btn-pagination"]}
          >
            Anterior
          </button>
          
          <span style={{ alignSelf: 'center' }}>
            Página {paginaAtual} de {totalPaginas}
          </span>
          
          <button 
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            className={styles["btn-pagination"]}
          >
            Próxima
          </button>

        </div>
      )}
      {/* --- FIM DA PAGINAÇÃO --- */}

      {/* Modal - Nova/Editar Atividade */}
      {showModal && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div
            className={styles["modal-content"]}
            onClick={(e) => e.stopPropagation()}
            id="modal-nova-atividade"
          >
            <div className={styles["modal-header"]}>
              <h2 className={styles["modal-title"]}>
                {editingActivity ? "Editar Atividade" : "Nova Atividade"}
              </h2>
              <button
                className={styles["modal-close"]}
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                id="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles["modal-form"]}>
              <div className={styles["form-field"]}>
                <label htmlFor="form-title" className={styles["form-label"]}>
                  Título da Atividade *
                </label>
                <input
                  id="form-title"
                  type="text"
                  value={formNomeAcao}
                  onChange={(e) => setFormNomeAcao(e.target.value)}
                  placeholder="Ex.: Oficina de Artes"
                  className={styles["form-input"]}
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className={styles["form-field"]}>
                <label
                  htmlFor="form-description"
                  className={styles["form-label"]}
                >
                  Descrição
                </label>
                <textarea
                  id="form-description"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Descreva a atividade..."
                  className={styles["form-textarea"]}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* --- BLOCO NOVO: Dimensão e Projeto --- */}
              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label
                    htmlFor="form-dimensao"
                    className={styles["form-label"]}
                  >
                    Dimensão *
                  </label>
                  <select
                    id="form-dimensao"
                    value={formDimensao}
                    onChange={(e) =>
                      setFormDimensao(e.target.value as Dimensao)
                    }
                    className={styles["form-select"]}
                    disabled={isSubmitting}
                  >
                    <option value="EDUCACAO">Educação</option>
                    <option value="SAUDE">Saúde</option>
                    <option value="MAE">Moradia, Água e Energia</option>
                    <option value="DESENVOLVIMENTO_ECONOMICO">
                      Desenvolvimento Econômico
                    </option>
                    <option value="NUTRICAO">Nutrição</option>
                  </select>
                </div>
                <div className={styles["form-field"]}>
                  <label
                    htmlFor="form-projeto"
                    className={styles["form-label"]}
                  >
                    Projeto *
                  </label>
                  <select
                    id="form-projeto"
                    value={formProjeto}
                    onChange={(e) => setFormProjeto(e.target.value as Projeto)}
                    className={styles["form-select"]}
                    disabled={isSubmitting}
                  >
                    <option value="REDEMAIS">Rede+</option>
                    <option value="PROA">PROA</option>
                  </select>
                </div>
              </div>

              {/* --- BLOCO ORIGINAL: Tipo e Formato --- */}
              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label htmlFor="form-type" className={styles["form-label"]}>
                    Tipo *
                  </label>
                  <select
                    id="form-type"
                    value={formTipoAtividade}
                    onChange={(e) =>
                      setFormTipoAtividade(e.target.value as TipoAtividade)
                    }
                    className={styles["form-select"]}
                    disabled={isSubmitting}
                  >
                    <option value="ATIVIDADE">Atividade</option>
                    <option value="ATENDIMENTO">Atendimento</option>
                  </select>
                </div>
                <div className={styles["form-field"]}>
                  <label htmlFor="form-format" className={styles["form-label"]}>
                    Formato *
                  </label>
                  <select
                    id="form-format"
                    value={formFormatoAtividade}
                    onChange={(e) =>
                      setFormFormatoAtividade(
                        e.target.value as FormatoAtividade,
                      )
                    }
                    className={styles["form-select"]}
                    disabled={isSubmitting}
                  >
                    <option value="GRUPO">Grupo</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
              </div>

              {/* --- BLOCO NOVO: Local e Semestre --- */}
              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label htmlFor="form-local" className={styles["form-label"]}>
                    Local *
                  </label>
                  <input
                    id="form-local"
                    type="text"
                    value={formLocal}
                    onChange={(e) => setFormLocal(e.target.value)}
                    placeholder="Ex.: Sede do Instituto"
                    className={styles["form-input"]}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles["form-field"]}>
                  <label
                    htmlFor="form-semestre"
                    className={styles["form-label"]}
                  >
                    Semestre (Ano.Semestre) *
                  </label>
                  <input
                    id="form-semestre"
                    type="text"
                    value={formSemestre}
                    onChange={(e) => setFormSemestre(e.target.value)}
                    placeholder="Ex.: 2024.1"
                    className={styles["form-input"]}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* --- BLOCO ORIGINAL: Data --- */}
              <div className={styles["form-field"]}>
                <label htmlFor="form-date" className={styles["form-label"]}>
                  Data *
                </label>
                <input
                  id="form-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={styles["form-input"]}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles["form-actions"]}>
                <button
                  type="button"
                  className={styles["btn-cancel"]}
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles["btn-submit"]}
                  disabled={isSubmitting}
                  id="btn-submit-atividade"
                >
                  {isSubmitting ? (
                    <span className={styles["btn-loading"]}>
                      <Loader2 size={16} className="spinner" />
                      {editingActivity ? "Salvando..." : "Cadastrando..."}
                    </span>
                  ) : editingActivity ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar Atividade"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detalhes */}
      {showDetailModal && selectedActivity && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className={`${styles["modal-content"]} ${styles["modal-detail"]}`}
            onClick={(e) => e.stopPropagation()}
            id="modal-detalhe-atividade"
          >
            <div className={styles["modal-header"]}>
              <h2 className={styles["modal-title"]}>
                {selectedActivity.nomeAcao}
              </h2>
              <button
                className={styles["modal-close"]}
                onClick={() => setShowDetailModal(false)}
                id="btn-close-detail"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles["detail-body"]}>
              <div className={styles["detail-tags"]}>
                <span
                  className={`${styles["activity-tag"]} ${selectedActivity.tipo === "ATENDIMENTO" ? styles["tag-atendimento"] : styles["tag-atividade"]}`}
                >
                  {selectedActivity.tipo === "ATENDIMENTO"
                    ? "Atendimento"
                    : "Atividade"}
                </span>
                <span
                  className={`${styles["activity-tag"]} ${styles["tag-format"]}`}
                >
                  {selectedActivity.formato === "INDIVIDUAL"
                    ? "Individual"
                    : "Grupo"}
                </span>
                <span className={styles["detail-date"]}>
                  <CalendarDays size={14} />
                  {formatDate(selectedActivity.date)}
                </span>
              </div>
              {selectedActivity.descricao && (
                <div className={styles["detail-section"]}>
                  <h3 className={styles["detail-section-title"]}>
                    Descrição
                  </h3>
                  <p className={styles["detail-description"]}>
                    {selectedActivity.descricao}
                  </p>
                </div>
              )}
              <div className={styles["detail-section"]}>
                <h3 className={styles["detail-section-title"]}>
                  Informações
                </h3>
                <div className={styles["detail-info-grid"]}>
                  <div className={styles["detail-info-item"]}>
                    <span className={styles["detail-info-label"]}>ID</span>
                    <span className={styles["detail-info-value"]}>
                      {selectedActivity.id}
                    </span>
                  </div>
                  <div className={styles["detail-info-item"]}>
                    <span className={styles["detail-info-label"]}>Tipo</span>
                    <span className={styles["detail-info-value"]}>
                      {selectedActivity.tipo === "ATENDIMENTO"
                        ? "Atendimento"
                        : "Atividade"}
                    </span>
                  </div>
                  <div className={styles["detail-info-item"]}>
                    <span className={styles["detail-info-label"]}>Formato</span>
                    <span className={styles["detail-info-value"]}>
                      {selectedActivity.formato === "INDIVIDUAL"
                        ? "Individual"
                        : "Grupo"}
                    </span>
                  </div>
                  <div className={styles["detail-info-item"]}>
                    <span className={styles["detail-info-label"]}>Data</span>
                    <span className={styles["detail-info-value"]}>
                      {formatDate(selectedActivity.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles["detail-actions-footer"]}>
                <button
                  className={styles["btn-edit-detail"]}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenEdit(selectedActivity);
                  }}
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button
                  className={styles["btn-delete-detail"]}
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowDeleteConfirm(selectedActivity.id);
                  }}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}