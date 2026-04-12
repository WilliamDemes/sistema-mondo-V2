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
  // Novos indicadores frontend
  engajamento?: "Alto" | "Médio" | "Baixo";
  autonomia?: "Alto" | "Médio" | "Baixo";
  foto?: string;
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
  const [engajamentoFilter, setEngajamentoFilter] = useState("TODOS");
  const [autonomiaFilter, setAutonomiaFilter] = useState("TODOS");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formIdMondo, setFormIdMondo] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formGrupo, setFormGrupo] = useState("");
  const [formObs, setFormObs] = useState("");
  const [showSugestoes, setShowSugestoes] = useState(false);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchFamilies = useCallback(async () => {
    try {
      const res = await fetch("/api/familias");
      if (!res.ok) throw new Error();
      const rawFamilies: Family[] = await res.json();
      
      // Injeção de dados simulados (Engajamento, Autonomia, Foto)
      const fotosMock = [
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=250&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=250&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484665754804-74b091211472?q=80&w=250&auto=format&fit=crop"
      ];
      const niveis = ["Alto", "Médio", "Baixo"] as const;

      const enhancedFamilies = rawFamilies.map(f => {
        // Usa o hash simples do ID para manter os dados os mesmos entre renders
        const hash = f.idMondoFamilia ? f.idMondoFamilia.charCodeAt(0) + f.idMondoFamilia.length : 0;
        return {
          ...f,
          engajamento: niveis[(hash) % 3],
          autonomia: niveis[(hash + 1) % 3],
          foto: fotosMock[hash % fotosMock.length]
        };
      });

      setFamilies(enhancedFamilies);
    } catch {
      addToast("error", "Erro ao carregar famílias.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const filtered = families
    .filter((f) => {
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
      const mfEng = engajamentoFilter === "TODOS" || f.engajamento === engajamentoFilter;
      const mfAut = autonomiaFilter === "TODOS" || f.autonomia === autonomiaFilter;
      return ms && mf && mfEng && mfAut;
    })
    .sort((a, b) => {
      // Ordena os IDs de forma crescente e inteligente (Numérica)
      return (a.idMondoFamilia || "").localeCompare(
        b.idMondoFamilia || "",
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });

  // 👇 ADICIONANDO LÓGICA DE SUGESTÕES:
  const sugestoes = families
    .flatMap(
      (f) =>
        f.beneficiarios?.map((b) => ({
          nome: b.nome,
          idFamilia: f.idMondoFamilia,
        })) || [],
    )
    .filter(
      (b) =>
        search.length > 1 &&
        (b.nome || "").toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 5); // Pega apenas os 5 primeiros para a lista não ficar gigante

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
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSugestoes(true);
            }}
            onFocus={() => setShowSugestoes(true)}
            onBlur={() => setTimeout(() => setShowSugestoes(false), 200)}
            className={styles["fp-search"]}
            id="filter-search-familia"
          />

          {showSugestoes && sugestoes.length > 0 && (
            <ul className={styles.suggestionsList}>
              {sugestoes.map((sug, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSearch(sug.nome);
                    setShowSugestoes(false);
                  }}
                  className={styles.suggestionItem}
                >
                  <Search size={14} color="#94a3b8" />
                  <span>
                    <strong>{sug.nome}</strong>{" "}
                    <span className={styles.suggestionSubtext}>
                      (Família #{sug.idFamilia})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles["fp-filter-group"]}>
          <Filter size={14} />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles["fp-filter-select"]}
          >
            <option value="TODOS">Status</option>
            <option value="ATIVA">ATIVA</option>
            <option value="INATIVA">INATIVA</option>
          </select>

          <select
            value={engajamentoFilter}
            onChange={(e) => setEngajamentoFilter(e.target.value)}
            className={styles["fp-filter-select"]}
          >
            <option value="TODOS">Engajamento</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
          </select>

          <select
            value={autonomiaFilter}
            onChange={(e) => setAutonomiaFilter(e.target.value)}
            className={styles["fp-filter-select"]}
          >
            <option value="TODOS">Autonomia</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
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
              <div className={styles["fc-body-split"]}>
                <div className={styles["fc-left"]}>
                  <div className={styles["fc-photo-wrap"]}>
                    <img src={f.foto} alt="Foto da familia" className={styles["fc-photo"]}/>
                  </div>
                </div>

                <div className={styles["fc-right"]}>
                  <div className={styles["fc-head"]}>
                    <h3 className={styles["fc-name"]}>
                      {(() => {
                        const responsavel = f.beneficiarios?.find((b) => b.responsavel === "Sim");
                        return responsavel ? `${f.idMondoFamilia} - ${responsavel.nome}` : `Familia #${f.idMondoFamilia}`;
                      })()}
                    </h3>
                    <div className={styles["fc-badges"]}>
                      <span className={`${styles["fc-pill"]} ${f.status === "ATIVA" ? styles["st-ativa"] : styles["st-inativa"]}`}>
                        {f.status === "ATIVA" ? "Ativa" : "Inativa"}
                      </span>
                      <span className={`${styles["fc-pill"]} ${f.engajamento === "Alto" ? styles["st-eng-alto"] : f.engajamento === "Médio" ? styles["st-eng-med"] : styles["st-eng-baixo"]}`}>
                        Engajamento {f.engajamento}
                      </span>
                      <span className={`${styles["fc-pill"]} ${f.autonomia === "Alto" ? styles["st-aut-alta"] : f.autonomia === "Médio" ? styles["st-aut-med"] : styles["st-aut-baixa"]}`}>
                        Autonomia {f.autonomia}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles["fc-info"]}>
                    <div className={styles["fc-row"]}>
                      <MapPin size={14} />
                      <span>{f.cidade} - {f.estado} </span>
                    </div>
                    <div className={styles["fc-row"]}>
                      <Users size={14} />
                      <span>{f._count?.beneficiarios ?? 0} integrantes • {f._count?.participations ?? 0} participações</span>
                    </div>
                  </div>
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
