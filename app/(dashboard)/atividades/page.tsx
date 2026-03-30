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

// â”€â”€ Types â”€â”€
type ActivityType = "ATENDIMENTO" | "ATIVIDADE";
type ActivityFormat = "INDIVIDUAL" | "GRUPO";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  format: ActivityFormat;
  date: string;
  createdAt: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// â”€â”€ Helpers â”€â”€
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AtividadesPage() {
  // â”€â”€ State â”€â”€
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"TODOS" | ActivityType>("TODOS");
  const [filterFormat, setFilterFormat] = useState<"TODOS" | ActivityFormat>("TODOS");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<ActivityType>("ATIVIDADE");
  const [formFormat, setFormFormat] = useState<ActivityFormat>("GRUPO");
  const [formDate, setFormDate] = useState("");

  // â”€â”€ Toast system â”€â”€
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // â”€â”€ Fetch activities from API â”€â”€
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/atividades");
      if (!res.ok) throw new Error("Erro ao carregar atividades");
      const data: Activity[] = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
      addToast("error", "Erro ao carregar atividades do servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // â”€â”€ Filtered & sorted â”€â”€
  const filteredActivities = activities.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === "TODOS" || a.type === filterType;
    const matchFormat = filterFormat === "TODOS" || a.format === filterFormat;
    return matchSearch && matchType && matchFormat;
  });

  // â”€â”€ Stats â”€â”€
  const totalAtividades = activities.filter((a) => a.type === "ATIVIDADE").length;
  const totalAtendimentos = activities.filter((a) => a.type === "ATENDIMENTO").length;
  const totalTotal = activities.length;

  // â”€â”€ Open new modal â”€â”€
  function handleOpenNew() {
    setEditingActivity(null);
    setFormTitle("");
    setFormDescription("");
    setFormType("ATIVIDADE");
    setFormFormat("GRUPO");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  }

  // â”€â”€ Open edit modal â”€â”€
  function handleOpenEdit(activity: Activity) {
    setEditingActivity(activity);
    setFormTitle(activity.title);
    setFormDescription(activity.description || "");
    setFormType(activity.type);
    setFormFormat(activity.format);
    setFormDate(activity.date);
    setShowModal(true);
  }

  // â”€â”€ Create or Update activity â”€â”€
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formTitle,
        description: formDescription || null,
        type: formType,
        format: formFormat,
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
          prev.map((a) => (a.id === updated.id ? updated : a))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        addToast("success", `Atividade "${updated.title}" atualizada com sucesso!`);
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
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        addToast("success", `Atividade "${created.title}" cadastrada com sucesso!`);
      }

      setShowModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      addToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // â”€â”€ Delete activity â”€â”€
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/atividades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir atividade");

      setActivities((prev) => prev.filter((a) => a.id !== id));
      setShowDeleteConfirm(null);
      addToast("success", "Atividade excluÃ­da com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir";
      addToast("error", message);
    }
  }

  // â”€â”€ View detail â”€â”€
  function handleViewDetail(activity: Activity) {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  }

  return (
    <div className={styles["atividades-page"]}>
      {/* Toast Notifications */}
      <div className={styles["toast-container"]} id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[`toast-${toast.type}`]}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
            <button className={styles["toast-close"]} onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}>
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
            Cadastre e gerencie atividades e atendimentos para os beneficiÃ¡rios
          </p>
        </div>
        <button className={styles["btn-new-activity"]} onClick={handleOpenNew} id="btn-nova-atividade">
          <Plus size={16} />
          Nova Atividade
        </button>
      </div>

      {/* Stats */}
      <div className={styles["atividades-stats"]} id="atividades-stats">
        <div className={styles["stat-mini"]} style={{ borderLeftColor: "#009999" }}>
          <div className={styles["stat-mini-icon"]} style={{ color: "#009999", background: "#00999912" }}>
            <ClipboardList size={18} />
          </div>
          <div className={styles["stat-mini-content"]}>
            <span className={styles["stat-mini-value"]}>{totalAtividades}</span>
            <span className={styles["stat-mini-label"]}>Atividades</span>
          </div>
        </div>
        <div className={styles["stat-mini"]} style={{ borderLeftColor: "#6B7F3E" }}>
          <div className={styles["stat-mini-icon"]} style={{ color: "#6B7F3E", background: "#6B7F3E12" }}>
            <Stethoscope size={18} />
          </div>
          <div className={styles["stat-mini-content"]}>
            <span className={styles["stat-mini-value"]}>{totalAtendimentos}</span>
            <span className={styles["stat-mini-label"]}>Atendimentos</span>
          </div>
        </div>
        <div className={styles["stat-mini"]} style={{ borderLeftColor: "#C9943E" }}>
          <div className={styles["stat-mini-icon"]} style={{ color: "#C9943E", background: "#C9943E12" }}>
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
            placeholder="Buscar por tÃ­tulo ou descriÃ§Ã£o..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles["filter-search-input"]}
            id="filter-search-atividade"
          />
        </div>
        <div className={styles["filter-selects"]}>
          <div className={styles["filter-select-group"]}>
            <Filter size={14} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as "TODOS" | ActivityType)} className={styles["filter-select"]} id="filter-tipo-atividade">
              <option value="TODOS">Todos os tipos</option>
              <option value="ATENDIMENTO">Atendimento</option>
              <option value="ATIVIDADE">Atividade</option>
            </select>
          </div>
          <div className={styles["filter-select-group"]}>
            <User size={14} />
            <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value as "TODOS" | ActivityFormat)} className={styles["filter-select"]} id="filter-formato-atividade">
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
            const isAtendimento = activity.type === "ATENDIMENTO";
            return (
              <div key={activity.id} className={styles["activity-card"]} id={`activity-${activity.id}`}>
                <div className={styles["activity-card-left"]}>
                  <div className={styles["activity-card-indicator"]} style={{ background: isAtendimento ? "#6B7F3E" : "#009999" }} />
                  <div className={styles["activity-card-content"]}>
                    <div className={styles["activity-card-top"]}>
                      <h3 className={styles["activity-card-title"]}>{activity.title}</h3>
                      <div className={styles["activity-card-tags"]}>
                        <span className={`${styles["activity-tag"]} ${isAtendimento ? styles["tag-atendimento"] : styles["tag-atividade"]}`}>
                          {isAtendimento ? "Atendimento" : "Atividade"}
                        </span>
                        <span className={`${styles["activity-tag"]} ${styles["tag-format"]}`}>
                          {activity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}
                        </span>
                      </div>
                    </div>
                    {activity.description && (<p className={styles["activity-card-description"]}>{activity.description}</p>)}
                    <div className={styles["activity-card-meta"]}>
                      <span className={styles["activity-meta-item"]}><CalendarDays size={14} />{formatDate(activity.date)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles["activity-card-actions"]}>
                  <button className={`${styles["activity-action-btn"]} ${styles["activity-action-view"]}`} onClick={() => handleViewDetail(activity)} title="Ver detalhes" id={`btn-ver-activity-${activity.id}`}><Eye size={16} /></button>
                  <button className={`${styles["activity-action-btn"]} ${styles["activity-action-edit"]}`} onClick={() => handleOpenEdit(activity)} title="Editar" id={`btn-edit-activity-${activity.id}`}><Edit3 size={16} /></button>
                  <button className={`${styles["activity-action-btn"]} ${styles["activity-action-delete"]}`} onClick={() => setShowDeleteConfirm(activity.id)} title="Excluir" id={`btn-delete-activity-${activity.id}`}><Trash2 size={16} /></button>
                </div>
                {showDeleteConfirm === activity.id && (
                  <div className={styles["delete-confirm-overlay"]}>
                    <div className={styles["delete-confirm-content"]}>
                      <p>Excluir <strong>{activity.title}</strong>?</p>
                      <div className={styles["delete-confirm-actions"]}>
                        <button className={styles["btn-cancel-sm"]} onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
                        <button className={styles["btn-delete-confirm"]} onClick={() => handleDelete(activity.id)}>Excluir</button>
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
              <button className={styles["btn-new-activity-empty"]} onClick={handleOpenNew}><Plus size={16} />Cadastrar Nova Atividade</button>
            </div>
          )}
        </div>
      )}

      {/* Modal - Nova/Editar Atividade */}
      {showModal && (
        <div className={styles["modal-overlay"]} onClick={() => !isSubmitting && setShowModal(false)}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()} id="modal-nova-atividade">
            <div className={styles["modal-header"]}>
              <h2 className={styles["modal-title"]}>{editingActivity ? "Editar Atividade" : "Nova Atividade"}</h2>
              <button className={styles["modal-close"]} onClick={() => !isSubmitting && setShowModal(false)} disabled={isSubmitting} id="btn-close-modal"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles["modal-form"]}>
              <div className={styles["form-field"]}>
                <label htmlFor="form-title" className={styles["form-label"]}>TÃ­tulo da Atividade *</label>
                <input id="form-title" type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex.: Oficina de Artes" className={styles["form-input"]} required disabled={isSubmitting} autoFocus />
              </div>
              <div className={styles["form-field"]}>
                <label htmlFor="form-description" className={styles["form-label"]}>DescriÃ§Ã£o</label>
                <textarea id="form-description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Descreva a atividade..." className={styles["form-textarea"]} rows={3} disabled={isSubmitting} />
              </div>
              <div className={styles["form-row"]}>
                <div className={styles["form-field"]}>
                  <label htmlFor="form-type" className={styles["form-label"]}>Tipo *</label>
                  <select id="form-type" value={formType} onChange={(e) => setFormType(e.target.value as ActivityType)} className={styles["form-select"]} disabled={isSubmitting}>
                    <option value="ATIVIDADE">Atividade</option>
                    <option value="ATENDIMENTO">Atendimento</option>
                  </select>
                </div>
                <div className={styles["form-field"]}>
                  <label htmlFor="form-format" className={styles["form-label"]}>Formato *</label>
                  <select id="form-format" value={formFormat} onChange={(e) => setFormFormat(e.target.value as ActivityFormat)} className={styles["form-select"]} disabled={isSubmitting}>
                    <option value="GRUPO">Grupo</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
              </div>
              <div className={styles["form-field"]}>
                <label htmlFor="form-date" className={styles["form-label"]}>Data *</label>
                <input id="form-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className={styles["form-input"]} required disabled={isSubmitting} />
              </div>
              <div className={styles["form-actions"]}>
                <button type="button" className={styles["btn-cancel"]} onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className={styles["btn-submit"]} disabled={isSubmitting} id="btn-submit-atividade">
                  {isSubmitting ? (<span className={styles["btn-loading"]}><Loader2 size={16} className="spinner" />{editingActivity ? "Salvando..." : "Cadastrando..."}</span>) : (editingActivity ? "Salvar AlteraÃ§Ãµes" : "Cadastrar Atividade")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detalhes */}
      {showDetailModal && selectedActivity && (
        <div className={styles["modal-overlay"]} onClick={() => setShowDetailModal(false)}>
          <div className={`${styles["modal-content"]} ${styles["modal-detail"]}`} onClick={(e) => e.stopPropagation()} id="modal-detalhe-atividade">
            <div className={styles["modal-header"]}>
              <h2 className={styles["modal-title"]}>{selectedActivity.title}</h2>
              <button className={styles["modal-close"]} onClick={() => setShowDetailModal(false)} id="btn-close-detail"><X size={20} /></button>
            </div>
            <div className={styles["detail-body"]}>
              <div className={styles["detail-tags"]}>
                <span className={`${styles["activity-tag"]} ${selectedActivity.type === "ATENDIMENTO" ? styles["tag-atendimento"] : styles["tag-atividade"]}`}>{selectedActivity.type === "ATENDIMENTO" ? "Atendimento" : "Atividade"}</span>
                <span className={`${styles["activity-tag"]} ${styles["tag-format"]}`}>{selectedActivity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}</span>
                <span className={styles["detail-date"]}><CalendarDays size={14} />{formatDate(selectedActivity.date)}</span>
              </div>
              {selectedActivity.description && (<div className={styles["detail-section"]}><h3 className={styles["detail-section-title"]}>DescriÃ§Ã£o</h3><p className={styles["detail-description"]}>{selectedActivity.description}</p></div>)}
              <div className={styles["detail-section"]}>
                <h3 className={styles["detail-section-title"]}>InformaÃ§Ãµes</h3>
                <div className={styles["detail-info-grid"]}>
                  <div className={styles["detail-info-item"]}><span className={styles["detail-info-label"]}>ID</span><span className={styles["detail-info-value"]}>{selectedActivity.id}</span></div>
                  <div className={styles["detail-info-item"]}><span className={styles["detail-info-label"]}>Tipo</span><span className={styles["detail-info-value"]}>{selectedActivity.type === "ATENDIMENTO" ? "Atendimento" : "Atividade"}</span></div>
                  <div className={styles["detail-info-item"]}><span className={styles["detail-info-label"]}>Formato</span><span className={styles["detail-info-value"]}>{selectedActivity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}</span></div>
                  <div className={styles["detail-info-item"]}><span className={styles["detail-info-label"]}>Data</span><span className={styles["detail-info-value"]}>{formatDate(selectedActivity.date)}</span></div>
                </div>
              </div>
              <div className={styles["detail-actions-footer"]}>
                <button className={styles["btn-edit-detail"]} onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedActivity); }}><Edit3 size={14} />Editar</button>
                <button className={styles["btn-delete-detail"]} onClick={() => { setShowDetailModal(false); setShowDeleteConfirm(selectedActivity.id); }}><Trash2 size={14} />Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
