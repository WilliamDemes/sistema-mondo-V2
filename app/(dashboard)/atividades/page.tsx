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

// ── Types ──
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

// ── Helpers ──
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AtividadesPage() {
  // ── State ──
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

  // ── Toast system ──
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // ── Fetch activities from API ──
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

  // ── Filtered & sorted ──
  const filteredActivities = activities.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === "TODOS" || a.type === filterType;
    const matchFormat = filterFormat === "TODOS" || a.format === filterFormat;
    return matchSearch && matchType && matchFormat;
  });

  // ── Stats ──
  const totalAtividades = activities.filter((a) => a.type === "ATIVIDADE").length;
  const totalAtendimentos = activities.filter((a) => a.type === "ATENDIMENTO").length;
  const totalTotal = activities.length;

  // ── Open new modal ──
  function handleOpenNew() {
    setEditingActivity(null);
    setFormTitle("");
    setFormDescription("");
    setFormType("ATIVIDADE");
    setFormFormat("GRUPO");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  }

  // ── Open edit modal ──
  function handleOpenEdit(activity: Activity) {
    setEditingActivity(activity);
    setFormTitle(activity.title);
    setFormDescription(activity.description || "");
    setFormType(activity.type);
    setFormFormat(activity.format);
    setFormDate(activity.date);
    setShowModal(true);
  }

  // ── Create or Update activity ──
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

  // ── Delete activity ──
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/atividades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir atividade");

      setActivities((prev) => prev.filter((a) => a.id !== id));
      setShowDeleteConfirm(null);
      addToast("success", "Atividade excluída com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir";
      addToast("error", message);
    }
  }

  // ── View detail ──
  function handleViewDetail(activity: Activity) {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  }

  return (
    <div className="atividades-page">
      {/* Toast Notifications */}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="atividades-header">
        <div>
          <h1 className="atividades-title">Atividades</h1>
          <p className="atividades-subtitle">
            Cadastre e gerencie atividades e atendimentos para os beneficiários
          </p>
        </div>
        <button className="btn-new-activity" onClick={handleOpenNew} id="btn-nova-atividade">
          <Plus size={16} />
          Nova Atividade
        </button>
      </div>

      {/* Stats */}
      <div className="atividades-stats" id="atividades-stats">
        <div className="stat-mini" style={{ borderLeftColor: "#009999" }}>
          <div className="stat-mini-icon" style={{ color: "#009999", background: "#00999912" }}>
            <ClipboardList size={18} />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-value">{totalAtividades}</span>
            <span className="stat-mini-label">Atividades</span>
          </div>
        </div>
        <div className="stat-mini" style={{ borderLeftColor: "#6B7F3E" }}>
          <div className="stat-mini-icon" style={{ color: "#6B7F3E", background: "#6B7F3E12" }}>
            <Stethoscope size={18} />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-value">{totalAtendimentos}</span>
            <span className="stat-mini-label">Atendimentos</span>
          </div>
        </div>
        <div className="stat-mini" style={{ borderLeftColor: "#C9943E" }}>
          <div className="stat-mini-icon" style={{ color: "#C9943E", background: "#C9943E12" }}>
            <Users size={18} />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-value">{totalTotal}</span>
            <span className="stat-mini-label">Total Cadastros</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="atividades-filters" id="atividades-filters">
        <div className="filter-search-wrapper">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
            id="filter-search-atividade"
          />
        </div>
        <div className="filter-selects">
          <div className="filter-select-group">
            <Filter size={14} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "TODOS" | ActivityType)}
              className="filter-select"
              id="filter-tipo-atividade"
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="ATENDIMENTO">Atendimento</option>
              <option value="ATIVIDADE">Atividade</option>
            </select>
          </div>
          <div className="filter-select-group">
            <User size={14} />
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value as "TODOS" | ActivityFormat)}
              className="filter-select"
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
        <div className="atividades-loading">
          <Loader2 size={32} className="spinner" />
          <p>Carregando atividades...</p>
        </div>
      )}

      {/* Activity List */}
      {!isLoading && (
        <div className="atividades-list" id="atividades-list">
          {filteredActivities.map((activity) => {
            const isAtendimento = activity.type === "ATENDIMENTO";

            return (
              <div key={activity.id} className="activity-card" id={`activity-${activity.id}`}>
                <div className="activity-card-left">
                  <div
                    className="activity-card-indicator"
                    style={{ background: isAtendimento ? "#6B7F3E" : "#009999" }}
                  />
                  <div className="activity-card-content">
                    <div className="activity-card-top">
                      <h3 className="activity-card-title">{activity.title}</h3>
                      <div className="activity-card-tags">
                        <span className={`activity-tag ${isAtendimento ? "tag-atendimento" : "tag-atividade"}`}>
                          {isAtendimento ? "Atendimento" : "Atividade"}
                        </span>
                        <span className="activity-tag tag-format">
                          {activity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}
                        </span>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="activity-card-description">{activity.description}</p>
                    )}
                    <div className="activity-card-meta">
                      <span className="activity-meta-item">
                        <CalendarDays size={14} />
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="activity-card-actions">
                  <button
                    className="activity-action-btn activity-action-view"
                    onClick={() => handleViewDetail(activity)}
                    title="Ver detalhes"
                    id={`btn-ver-activity-${activity.id}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="activity-action-btn activity-action-edit"
                    onClick={() => handleOpenEdit(activity)}
                    title="Editar"
                    id={`btn-edit-activity-${activity.id}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="activity-action-btn activity-action-delete"
                    onClick={() => setShowDeleteConfirm(activity.id)}
                    title="Excluir"
                    id={`btn-delete-activity-${activity.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Inline delete confirmation */}
                {showDeleteConfirm === activity.id && (
                  <div className="delete-confirm-overlay">
                    <div className="delete-confirm-content">
                      <p>Excluir <strong>{activity.title}</strong>?</p>
                      <div className="delete-confirm-actions">
                        <button className="btn-cancel-sm" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
                        <button className="btn-delete-confirm" onClick={() => handleDelete(activity.id)}>Excluir</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredActivities.length === 0 && !isLoading && (
            <div className="atividades-empty">
              <ClipboardList size={40} />
              <p>Nenhuma atividade encontrada.</p>
              <button className="btn-new-activity-empty" onClick={handleOpenNew}>
                <Plus size={16} />
                Cadastrar Nova Atividade
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal - Nova/Editar Atividade */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} id="modal-nova-atividade">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingActivity ? "Editar Atividade" : "Nova Atividade"}
              </h2>
              <button
                className="modal-close"
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                id="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-field">
                <label htmlFor="form-title" className="form-label">Título da Atividade *</label>
                <input
                  id="form-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex.: Oficina de Artes"
                  className="form-input"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="form-description" className="form-label">Descrição</label>
                <textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva a atividade..."
                  className="form-textarea"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="form-type" className="form-label">Tipo *</label>
                  <select
                    id="form-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ActivityType)}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="ATIVIDADE">Atividade</option>
                    <option value="ATENDIMENTO">Atendimento</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="form-format" className="form-label">Formato *</label>
                  <select
                    id="form-format"
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as ActivityFormat)}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="GRUPO">Grupo</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="form-date" className="form-label">Data *</label>
                <input
                  id="form-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting} id="btn-submit-atividade">
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <Loader2 size={16} className="spinner" />
                      {editingActivity ? "Salvando..." : "Cadastrando..."}
                    </span>
                  ) : (
                    editingActivity ? "Salvar Alterações" : "Cadastrar Atividade"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detalhes */}
      {showDetailModal && selectedActivity && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()} id="modal-detalhe-atividade">
            <div className="modal-header">
              <h2 className="modal-title">{selectedActivity.title}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)} id="btn-close-detail">
                <X size={20} />
              </button>
            </div>

            <div className="detail-body">
              <div className="detail-tags">
                <span className={`activity-tag ${selectedActivity.type === "ATENDIMENTO" ? "tag-atendimento" : "tag-atividade"}`}>
                  {selectedActivity.type === "ATENDIMENTO" ? "Atendimento" : "Atividade"}
                </span>
                <span className="activity-tag tag-format">
                  {selectedActivity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}
                </span>
                <span className="detail-date">
                  <CalendarDays size={14} />
                  {formatDate(selectedActivity.date)}
                </span>
              </div>

              {selectedActivity.description && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Descrição</h3>
                  <p className="detail-description">{selectedActivity.description}</p>
                </div>
              )}

              <div className="detail-section">
                <h3 className="detail-section-title">Informações</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-info-label">ID</span>
                    <span className="detail-info-value">{selectedActivity.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">Tipo</span>
                    <span className="detail-info-value">{selectedActivity.type === "ATENDIMENTO" ? "Atendimento" : "Atividade"}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">Formato</span>
                    <span className="detail-info-value">{selectedActivity.format === "INDIVIDUAL" ? "Individual" : "Grupo"}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">Data</span>
                    <span className="detail-info-value">{formatDate(selectedActivity.date)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-actions-footer">
                <button className="btn-edit-detail" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedActivity); }}>
                  <Edit3 size={14} />
                  Editar
                </button>
                <button className="btn-delete-detail" onClick={() => { setShowDetailModal(false); setShowDeleteConfirm(selectedActivity.id); }}>
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .atividades-page {
          max-width: 1100px;
        }

        /* ── Toasts ── */
        .toast-container {
          position: fixed;
          top: 76px;
          right: 24px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(73, 27, 2, 0.12);
          pointer-events: auto;
          animation: toastSlide 0.3s ease;
          min-width: 280px;
        }

        .toast-success {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }

        .toast-error {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }

        .toast-close {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.6;
          padding: 2px;
        }

        .toast-close:hover {
          opacity: 1;
        }

        @keyframes toastSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ── Spinner ── */
        :global(.spinner) {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Loading ── */
        .atividades-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #8B7355;
        }

        .atividades-loading p {
          font-size: 14px;
        }

        /* ── Header ── */
        .atividades-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .atividades-title {
          font-size: 28px;
          font-weight: 700;
          color: #491B02;
          margin-bottom: 4px;
        }

        .atividades-subtitle {
          font-size: 14px;
          color: #8B7355;
        }

        .btn-new-activity {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #C0272D, #D4444A);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(192, 39, 45, 0.25);
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-new-activity:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(192, 39, 45, 0.35);
        }

        /* ── Stats ── */
        .atividades-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border-radius: 10px;
          padding: 14px 16px;
          border-left: 3px solid transparent;
          box-shadow: 0 1px 3px rgba(73, 27, 2, 0.06);
          transition: all 0.3s ease;
        }

        .stat-mini-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-mini-content {
          display: flex;
          flex-direction: column;
        }

        .stat-mini-value {
          font-size: 22px;
          font-weight: 800;
          color: #491B02;
          line-height: 1;
        }

        .stat-mini-label {
          font-size: 12px;
          font-weight: 500;
          color: #8B7355;
          margin-top: 2px;
        }

        /* ── Filters ── */
        .atividades-filters {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .filter-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8B7355;
          pointer-events: none;
        }

        .filter-search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1.5px solid #E8D5C0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          color: #491B02;
          background: #FFFFFF;
          outline: none;
          transition: border-color 0.2s;
        }

        .filter-search-input::placeholder {
          color: #C9943E80;
        }

        .filter-search-input:focus {
          border-color: #C9943E;
          box-shadow: 0 0 0 3px rgba(201, 148, 62, 0.1);
        }

        .filter-selects {
          display: flex;
          gap: 10px;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 4px 0 10px;
          border: 1.5px solid #E8D5C0;
          border-radius: 8px;
          background: #FFFFFF;
          color: #6B3A1F;
        }

        .filter-select {
          padding: 9px 8px;
          border: none;
          font-size: 13px;
          font-family: inherit;
          color: #491B02;
          background: transparent;
          outline: none;
          cursor: pointer;
          min-width: 120px;
        }

        /* ── Activity Cards ── */
        .atividades-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-card {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(73, 27, 2, 0.06);
          transition: all 0.2s;
          border: 1px solid transparent;
          position: relative;
        }

        .activity-card:hover {
          border-color: #C9943E30;
          box-shadow: 0 4px 12px rgba(73, 27, 2, 0.08);
          transform: translateY(-1px);
        }

        .activity-card-left {
          display: flex;
          flex: 1;
        }

        .activity-card-indicator {
          width: 4px;
          flex-shrink: 0;
        }

        .activity-card-content {
          padding: 16px 20px;
          flex: 1;
        }

        .activity-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 6px;
          gap: 12px;
        }

        .activity-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #491B02;
        }

        .activity-card-tags {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .activity-tag {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          border: 1.5px solid;
          white-space: nowrap;
        }

        .tag-atendimento {
          color: #6B7F3E;
          border-color: #6B7F3E;
          background: #6B7F3E10;
        }

        .tag-atividade {
          color: #009999;
          border-color: #009999;
          background: #00999910;
        }

        .tag-format {
          color: #491B02;
          border-color: #491B0230;
          background: #491B0208;
        }

        .activity-card-description {
          font-size: 13px;
          color: #6B3A1F;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .activity-card-meta {
          display: flex;
          gap: 20px;
        }

        .activity-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #8B7355;
          font-weight: 500;
        }

        .activity-card-actions {
          display: flex;
          flex-direction: column;
          border-left: 1px solid #F0E6D8;
        }

        .activity-action-btn {
          flex: 1;
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .activity-action-view { color: #009999; }
        .activity-action-view:hover { background: #00999910; }
        .activity-action-edit { color: #C9943E; }
        .activity-action-edit:hover { background: #C9943E10; }
        .activity-action-delete { color: #C0272D; }
        .activity-action-delete:hover { background: #C0272D10; }

        /* ── Delete Confirm ── */
        .delete-confirm-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 5;
          animation: fadeIn 0.15s ease;
        }

        .delete-confirm-content {
          text-align: center;
        }

        .delete-confirm-content p {
          font-size: 14px;
          color: #491B02;
          margin-bottom: 12px;
        }

        .delete-confirm-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .btn-cancel-sm {
          padding: 6px 14px;
          background: transparent;
          border: 1.5px solid #E8D5C0;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          color: #6B3A1F;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel-sm:hover {
          background: #F8E4CC;
        }

        .btn-delete-confirm {
          padding: 6px 14px;
          background: #C0272D;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-delete-confirm:hover {
          background: #A01F25;
        }

        /* ── Empty ── */
        .atividades-empty {
          text-align: center;
          padding: 60px 20px;
          color: #8B7355;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(73, 27, 2, 0.06);
        }

        .atividades-empty p { font-size: 15px; }

        .btn-new-activity-empty {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #009999;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }

        .btn-new-activity-empty:hover { background: #007777; }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(73, 27, 2, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          width: 100%;
          max-width: 520px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(73, 27, 2, 0.15);
          animation: modalSlide 0.25s ease;
          max-height: 85vh;
          overflow-y: auto;
        }

        .modal-detail { max-width: 560px; }

        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #F0E6D8;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #491B02;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #8B7355;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #F8E4CC;
          color: #491B02;
        }

        /* ── Form ── */
        .modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #491B02;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 10px 14px;
          border: 1.5px solid #E8D5C0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          color: #491B02;
          background: #FEFBF7;
          outline: none;
          transition: all 0.2s;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #C9943E;
          box-shadow: 0 0 0 3px rgba(201, 148, 62, 0.1);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #C9943E80;
        }

        .form-input:disabled,
        .form-select:disabled,
        .form-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid #F0E6D8;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: transparent;
          color: #6B3A1F;
          border: 1.5px solid #E8D5C0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover { background: #F8E4CC; border-color: #C9943E; }
        .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #6B7F3E, #7A9147);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(107, 127, 62, 0.3);
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #5F7136, #6B7F3E);
          box-shadow: 0 4px 12px rgba(107, 127, 62, 0.4);
          transform: translateY(-1px);
        }

        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-loading {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Detail Modal ── */
        .detail-body {
          padding: 0 0 24px;
        }

        .detail-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          flex-wrap: wrap;
        }

        .detail-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #8B7355;
          font-weight: 500;
          margin-left: auto;
        }

        .detail-section {
          padding: 0 24px 16px;
        }

        .detail-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #491B02;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-description {
          font-size: 14px;
          color: #6B3A1F;
          line-height: 1.6;
        }

        .detail-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .detail-info-item {
          background: #FEFBF7;
          border-radius: 8px;
          padding: 10px 14px;
          border: 1px solid #F0E6D8;
        }

        .detail-info-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #8B7355;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }

        .detail-info-value {
          font-size: 14px;
          font-weight: 600;
          color: #491B02;
        }

        .detail-actions-footer {
          display: flex;
          gap: 8px;
          padding: 0 24px;
          margin-top: 8px;
        }

        .btn-edit-detail,
        .btn-delete-detail {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid;
        }

        .btn-edit-detail {
          color: #C9943E;
          border-color: #C9943E;
          background: transparent;
        }

        .btn-edit-detail:hover {
          background: #C9943E;
          color: #FFFFFF;
        }

        .btn-delete-detail {
          color: #C0272D;
          border-color: #C0272D;
          background: transparent;
        }

        .btn-delete-detail:hover {
          background: #C0272D;
          color: #FFFFFF;
        }

        @media (max-width: 768px) {
          .atividades-stats { grid-template-columns: 1fr; }
          .atividades-filters { flex-direction: column; }
          .filter-selects { width: 100%; }
          .activity-card-top { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
          .detail-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
