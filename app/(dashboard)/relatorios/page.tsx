"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Search,
  Check,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import styles from "./Relatorios.module.css";

interface Family {
  id_sistema: string;
  idFamilia: string;
  cidade: string;
  estado: string;
  grupoReferencia: string | null;
  status: string;
  observacao: string | null;
  criadoEm: string;
}
interface Beneficiary {
  id: string;
  nome: string;
  idade: number;
  parentesco: string;
}
interface Activity {
  idAcao: string;
  nomeAcao: string;
  categoria: string;
  formato: string;
  data: string;
  descricao: string | null;
}
interface Participation {
  id: string;
  contagemParticipantes: number;
  observacoes: string | null;
  acoes: Activity;
}
interface FamilyDetail extends Family {
  beneficiarios: Beneficiary[];
  participacoes: Participation[];
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

const REPORT_FIELDS = [
  {
    key: "general",
    label: "Dados Gerais",
    desc: "Nome, território, endereço, status, data de cadastro",
  },
  {
    key: "beneficiarios",
    label: "Integrantes",
    desc: "Nome, idade e papel de cada membro da família",
  },
  {
    key: "contagemParticipantes",
    label: "Número de Participações",
    desc: "Total de ações que a família participou",
  },
  {
    key: "participationList",
    label: "Lista de Ações",
    desc: "Detalhes de cada atividade participada",
  },
  {
    key: "observations",
    label: "Observações",
    desc: "Notas e observações registradas",
  },
];

export default function RelatoriosPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("ALL");
  const [familyDetails, setFamilyDetails] = useState<FamilyDetail[]>([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(REPORT_FIELDS.map((f) => f.key)),
  );
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/relatorios");
        if (res.ok) {
          const dadosCompletos = await res.json();
          setFamilies(dadosCompletos);
          setFamilyDetails(dadosCompletos); // Preenchemos os detalhes instantaneamente.
        }
      } catch {
        addToast("error", "Erro ao carregar famílias.");
      } finally {
        setLoading(false);
        setLoadingDetails(false); // Já desligamos o segundo "carregando" da tela
      }
    })();
  }, [addToast]);

  function toggleField(key: string) {
    setSelectedFields((p) => {
      const n = new Set(p);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  function exportPDF() {
    const content = previewRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("error", "Popup bloqueado. Permita popups para exportar.");
      return;
    }
    printWindow.document
      .write(`<!DOCTYPE html><html><head><title>Relatório Instituto Mondó</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box} body{font-family:'Bricolage Grotesque',sans-serif;padding:32px;color:#491B02;font-size:13px}
      h1{font-size:22px;margin-bottom:4px;color:#491B02} .sub{font-size:11px;color:#8B7355;margin-bottom:24px}
      .family-section{margin-bottom:28px;page-break-inside:avoid;border:1px solid #E8D5C0;border-radius:10px;padding:16px}
      h2{font-size:17px;margin-bottom:10px;color:#491B02;border-bottom:2px solid #C9943E;padding-bottom:6px} h3{font-size:14px;margin:12px 0 6px;color:#6B3A1F}
      table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px} th,td{padding:6px 10px;text-align:left;border:1px solid #E8D5C0} th{background:#FDF6ED;font-weight:600;color:#491B02}
      .stat{display:inline-block;padding:4px 12px;background:#ECFDF5;border-radius:20px;font-weight:600;color:#059669;font-size:12px;margin-bottom:12px}
      .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-right:4px}
      .badge-ativa{background:#ECFDF5;color:#059669}.badge-inativa{background:#FEF2F2;color:#DC2626}
      .obs-text{padding:8px 12px;background:#FDF6ED;border-radius:6px;font-style:italic;color:#6B3A1F;line-height:1.5}
      .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:3px solid #C0272D;padding-bottom:12px}
      .logo{font-size:14px;font-weight:700;color:#C0272D} .date{font-size:11px;color:#8B7355}
      @media print{body{padding:16px}}
    </style></head><body>
      <div class="header"><div><span class="logo">instituto mondó</span><h1>Relatório de Famílias</h1><div class="sub">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</div></div><div class="date">${familyDetails.length} família(s)</div></div>
      ${content.innerHTML}
    </body></html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    addToast("success", "PDF preparado para impressão!");
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    if (selectedFields.has("general")) {
      const data = familyDetails.map((f) => ({
        Nome: f.grupoReferencia || "Não informado",
        Território: f.cidade,
        Endereço: f.estado,
        Status: f.status,
        "Data Cadastro": fmtDate(f.criadoEm),
        ...(selectedFields.has("contagemParticipantes")
          ? { "Total Participações": f.participacoes.length }
          : {}),
        ...(selectedFields.has("observations")
          ? { Observações: f.observacao || "-" }
          : {}),
      }));
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(data),
        "Famílias",
      );
    }
    if (selectedFields.has("beneficiarios")) {
      const data = familyDetails.flatMap((f) =>
        f.beneficiarios.map((b) => ({
          Família: f.grupoReferencia || "Não informado",
          Nome: b.nome,
          Idade: b.idade,
          Papel: roleLabels[b.parentesco] || b.parentesco,
        })),
      );
      if (data.length)
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(data),
          "Integrantes",
        );
    }
    if (selectedFields.has("participationList")) {
      const data = familyDetails.flatMap((f) =>
        f.participacoes.map((p) => ({
          Família: f.grupoReferencia || "Não informado",
          Atividade: p.acoes.nomeAcao,
          Tipo: p.acoes.categoria,
          Formato: p.acoes.formato,
          Data: fmtDate(p.acoes.data),
          Participantes: p.contagemParticipantes,
          Observações: p.observacoes || "-",
        })),
      );
      if (data.length)
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(data),
          "Participações",
        );
    }
    XLSX.writeFile(
      wb,
      `relatorio_mondo_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    addToast("success", "Arquivo Excel baixado com sucesso!");
  }

  const familiasFiltradas =
    selectedFamilyId === "ALL"
      ? familyDetails
      : familyDetails.filter((f) => f.id_sistema === selectedFamilyId);

  return (
    <div className={styles.rp}>
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
      <div className={styles["rp-header"]}>
        <div>
          <h1 className={styles["rp-title"]}>Relatórios</h1>
          <p className={styles["rp-sub"]}>
            Exporte informações consolidadas das famílias
          </p>
        </div>
        <div className={styles["rp-export"]}>
          <button
            className={styles["rp-btn-pdf"]}
            onClick={exportPDF}
            disabled={loadingDetails || familyDetails.length === 0}
          >
            <Printer size={16} />
            Exportar PDF
          </button>
          <button
            className={styles["rp-btn-excel"]}
            onClick={exportExcel}
            disabled={loadingDetails || familyDetails.length === 0}
          >
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className={styles["rp-config"]}>
        <div className={styles["rp-col"]}>
          <h2 className={styles["rp-sect"]}>Filtros</h2>
          <div className={styles["rp-field"]}>
            <label className={styles["rp-label"]}>Família</label>
            <select
              value={selectedFamilyId}
              onChange={(e) => setSelectedFamilyId(e.target.value)}
              className={styles["rp-select"]}
              disabled={loading}
            >
              <option value="ALL">Todas as famílias</option>
              {families.map((f) => (
                <option key={f.id_sistema} value={f.id_sistema}>
                  {f.idFamilia}
                </option>
              ))}
            </select>
          </div>
          <h2 className={styles["rp-sect"]} style={{ marginTop: 20 }}>
            Campos do Relatório
          </h2>
          <div className={styles["rp-fields"]}>
            {REPORT_FIELDS.map((f) => (
              <label
                key={f.key}
                className={`${styles["rp-check"]} ${selectedFields.has(f.key) ? styles["rp-check-active"] : ""}`}
              >
                <div
                  className={`${styles.ckbox} ${selectedFields.has(f.key) ? styles.ckd : ""}`}
                  onClick={() => toggleField(f.key)}
                >
                  {selectedFields.has(f.key) && <Check size={14} />}
                </div>
                <div>
                  <span className={styles["ck-l"]}>{f.label}</span>
                  <span className={styles["ck-d"]}>{f.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className={styles["rp-prev"]}>
          <h2 className={styles["rp-sect"]}>
            <Eye size={16} />
            Pré-visualização
          </h2>
          {loadingDetails ? (
            <div className={styles["rp-loading"]}>
              <Loader2 size={24} className="spinner" />
              <p>Carregando...</p>
            </div>
          ) : (
            <div ref={previewRef} className={styles["rp-preview-content"]}>
              {familiasFiltradas.map((f) => (
                <div key={f.id_sistema} className={styles.pf}>
                  {selectedFields.has("general") && (
                    <div className={styles.pg}>
                      <h2 className={styles["pf-name"]}>
                        {f.idFamilia}{" "}
                        <span
                          className={`${styles.pb} ${f.status === "ATIVA" ? styles.pba : styles.pbi}`}
                        >
                          {f.status}
                        </span>
                      </h2>
                      <table className={styles.pt}>
                        <tbody>
                          <tr>
                            <th>Território</th>
                            <td>{f.cidade}</td>
                          </tr>
                          <tr>
                            <th>Endereço</th>
                            <td>{f.estado}</td>
                          </tr>
                          <tr>
                            <th>Cadastro</th>
                            <td>{fmtDate(f.criadoEm)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {selectedFields.has("contagemParticipantes") && (
                    <div className={styles.ps}>
                      <span className={styles.pst}>
                        {f.participacoes.length} participações registradas
                      </span>
                    </div>
                  )}
                  {selectedFields.has("beneficiarios") &&
                    f.beneficiarios.length > 0 && (
                      <div className={styles.pb2}>
                        <h3 className={styles.ph3}>
                          Integrantes ({f.beneficiarios.length})
                        </h3>
                        <table className={styles.pt}>
                          <thead>
                            <tr>
                              <th>Nome</th>
                              <th>Idade</th>
                              <th>Papel</th>
                            </tr>
                          </thead>
                          <tbody>
                            {f.beneficiarios.map((b) => (
                              <tr key={b.id}>
                                <td>{b.nome}</td>
                                <td>{b.idade}</td>
                                <td>
                                  {roleLabels[b.parentesco] || b.parentesco}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  {selectedFields.has("participationList") &&
                    f.participacoes.length > 0 && (
                      <div className={styles.pp}>
                        <h3 className={styles.ph3}>
                          Ações Participadas ({f.participacoes.length})
                        </h3>
                        <table className={styles.pt}>
                          <thead>
                            <tr>
                              <th>Atividade</th>
                              <th>Tipo</th>
                              <th>Data</th>
                              <th>Part.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {f.participacoes.map((p) => (
                              <tr key={p.id}>
                                <td>{p.acoes.nomeAcao}</td>
                                <td>
                                  {p.acoes.categoria}
                                </td>
                                <td>{fmtDate(p.acoes.data)}</td>
                                <td>{p.contagemParticipantes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  {selectedFields.has("observations") && f.observacao && (
                    <div className={styles.po}>
                      <h3 className={styles.ph3}>Observações</h3>
                      <p className={styles.pot}>{f.observacao}</p>
                    </div>
                  )}
                </div>
              ))}
              {familyDetails.length === 0 && (
                <p
                  style={{ textAlign: "center", padding: 32, color: "#8B7355" }}
                >
                  Nenhuma família encontrada.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
