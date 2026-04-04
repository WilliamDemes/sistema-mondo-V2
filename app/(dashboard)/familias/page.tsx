"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  MapPin,
  ChevronRight,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import styles from "./Familias.module.css";

// Interface de acordo com o prisma
interface Family {
  id: string;
  idMondoFamilia: string;
  cidade: string;
  estado: string;
  grupoReferencia: string;
  status: string;
  observacao: string | null;
  createdAt: string;
  _count?: {
    beneficiarios: number;
    participations: number;
  };
  beneficiarios?: {
    nome: string;
    responsavel: string;
  }[];
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

export default function FamiliasPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formIdMondo, setFormIdMondo] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formGrupo, setFormGrupo] = useState("");
  const [formObs, setFormObs] = useState("");

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchFamilies = useCallback(async () => {
    try {
      const res = await fetch("/api/familias");
      if (!res.ok) throw new Error();
      setFamilies(await res.json());
    } catch {
      addToast("error", "Erro ao carregar famílias.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const filtered = families.filter((f) => {
    const termo = search.toLocaleLowerCase();

    //Pesquisa no ID da familia
    const matchId = (f.idMondoFamilia || "")
      .toLocaleLowerCase()
      .includes(termo);

    // Pesquisa na cidade
    const matchCidade = (f.cidade || "").toLowerCase().includes(termo);

    //Pesquisa no nome de todos os beneficiarios daquela família
    const matchMorador = f.beneficiarios?.some((b) =>
      (b.nome || "").toLowerCase().includes(termo),
    );

    // Se o termo bater com o ID, com a cidade OU com o nome de alguém, a família aparece.

    const ms = matchId || matchCidade || matchMorador;
    const mf = statusFilter === "TODOS" || f.status === statusFilter;
    return ms && mf;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/familias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IdMondoFamilia: formIdMondo,
          cidade: formCidade,
          estado: "Estado",
          observacao: formObs || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setFamilies((p) => [
        ...p,
        { ...created, membersCount: 0, participationsCount: 0 },
      ]);
      setShowModal(false);
      setFormIdMondo("");
      setFormObs("");
      setFormObs("");
      addToast("success", `Família "${created.familyName}" cadastrada!`);
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Erro ao criar família",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.fp}>
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

      <div className={styles["fp-header"]}>
        <div>
          <h1 className={styles["fp-title"]}>Famílias</h1>
          <p className={styles["fp-sub"]}>
            Gerencie as famílias acompanhadas pelo Instituto
          </p>
        </div>
        <button
          className={styles["fp-btn-add"]}
          onClick={() => setShowModal(true)}
          id="btn-nova-familia-page"
        >
          <Plus size={16} />
          Nova Família
        </button>
      </div>

      <div className={styles["fp-filters"]}>
        <div className={styles["fp-search-wrap"]}>
          <Search size={16} className={styles["fp-search-icon"]} />
          <input
            placeholder="Buscar por nome ou território..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles["fp-search"]}
            id="filter-search-familia"
          />
        </div>
        <div className={styles["fp-filter-group"]}>
          <Filter size={14} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles["fp-filter-select"]}
          >
            <option value="TODOS">TODOS</option>
            <option value="ATIVA">ATIVA</option>
            <option value="INATIVA">INATIVA</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles["fp-loading"]}>
          <Loader2 size={32} className="spinner" />
          <p>Carregando famílias...</p>
          <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div className={styles["fp-grid"]}>
          {filtered.map((f) => (
            <Link
              key={f.id}
              href={`/familias/${f.id}`}
              className={styles.fc}
              id={`familia-card-${f.id}`}
            >
              <div className={styles["fc-head"]}>
                <h3 className={styles["fc-name"]}>
                  {(() => {
                    const responsavel = f.beneficiarios?.find(
                      (b) => b.responsavel === "Sim",
                    );

                    // Se achou o rsposavel, mostra "ID - NOme". Se não acho mostra "Familia #ID"
                    return responsavel
                      ? `${f.idMondoFamilia} - ${responsavel.nome}`
                      : `Familia #${f.idMondoFamilia}`;
                  })()}
                </h3>
                <span
                  className={`${styles["fc-status"]} ${f.status === "ATIVA" ? styles["st-a"] : styles["st-i"]}`}
                >
                  {f.status === "ATIVA" ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className={styles["fc-info"]}>
                <div className={styles["fc-row"]}>
                  <MapPin size={14} />
                  <span>
                    {f.cidade} - {f.estado}{" "}
                  </span>
                </div>
                <div className={styles["fc-row"]}>
                  <Users size={14} />
                  <span>
                    {f._count?.beneficiarios ?? 0} integrantes •{" "}
                    {f._count?.participations ?? 0} participações
                  </span>
                </div>
              </div>
              <div className={styles["fc-foot"]}>
                <span className={styles["fc-view"]}>Ver histórico</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && !loading && (
            <div className={styles["fp-empty"]}>
              <Users size={40} />
              <p>Nenhuma família encontrada.</p>
              <button
                className={styles["fp-btn-empty"]}
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                Cadastrar Família
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div
          className={styles["modal-ov"]}
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div
            className={styles["modal-c"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-h"]}>
              <h2>Nova Família</h2>
              <button
                className={styles["modal-x"]}
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles["modal-f"]}>
              <div className={styles.ff}>
                <label className={styles.fl}>Nome da Família *</label>
                <input
                  value={formIdMondo}
                  onChange={(e) => setFormIdMondo(e.target.value)}
                  placeholder="Ex.: Silva Santos"
                  className={styles.fi}
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Território *</label>
                <input
                  value={formCidade}
                  onChange={(e) => setFormCidade(e.target.value)}
                  placeholder="Ex.: Comunidade São José"
                  className={styles.fi}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Endereço *</label>
                <input
                  value={formCidade}
                  onChange={(e) => setFormCidade(e.target.value)}
                  placeholder="Ex.: Rua das Flores, 123"
                  className={styles.fi}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.ff}>
                <label className={styles.fl}>Observações</label>
                <textarea
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Informações adicionais..."
                  className={styles.ft}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.fa}>
                <button
                  type="button"
                  className={styles["btn-c"]}
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles["btn-s"]}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles["btn-l"]}>
                      <Loader2 size={16} className="spinner" />
                      <style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Cadastrando...
                    </span>
                  ) : (
                    "Cadastrar Família"
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
