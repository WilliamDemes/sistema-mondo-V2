"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FileSpreadsheet, FileText, Download, Search, Check, X, Loader2, CheckCircle2, AlertCircle, Filter, Eye, Printer } from "lucide-react";
import * as XLSX from "xlsx";

interface Family { id:string; familyName:string; territory:string; address:string; status:string; observations:string|null; createdAt:string; membersCount?:number; participationsCount?:number; }
interface Beneficiary { id:string; name:string; age:number; role:string; }
interface Activity { id:string; title:string; type:string; format:string; date:string; description:string|null; }
interface Participation { id:string; activityId:string; participantCount:number; notes:string|null; activity:Activity; }
interface FamilyDetail extends Family { beneficiaries:Beneficiary[]; participations:Participation[]; }
interface Toast { id:number; type:"success"|"error"; message:string; }

const roleLabels: Record<string,string> = { PAI:"Pai", MAE:"Mãe", FILHO:"Filho", FILHA:"Filha", AVO:"Avó/Avô", OUTRO:"Outro" };
function fmtDate(d:string){ return new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}); }

const REPORT_FIELDS = [
  { key: "general", label: "Dados Gerais", desc: "Nome, território, endereço, status, data de cadastro" },
  { key: "beneficiaries", label: "Integrantes", desc: "Nome, idade e papel de cada membro da família" },
  { key: "participationCount", label: "Número de Participações", desc: "Total de ações que a família participou" },
  { key: "participationList", label: "Lista de Ações", desc: "Detalhes de cada atividade participada" },
  { key: "observations", label: "Observações", desc: "Notas e observações registradas" },
];

export default function RelatoriosPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("ALL");
  const [familyDetails, setFamilyDetails] = useState<FamilyDetail[]>([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(REPORT_FIELDS.map(f=>f.key)));
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((type:"success"|"error",message:string) => {
    const id = Date.now(); setToasts(p=>[...p,{id,type,message}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  useEffect(() => {
    (async () => {
      try { const res = await fetch("/api/familias"); if(res.ok) setFamilies(await res.json()); }
      catch { addToast("error","Erro ao carregar famílias."); }
      finally { setLoading(false); }
    })();
  },[addToast]);

  const fetchDetails = useCallback(async () => {
    setLoadingDetails(true);
    try {
      if (selectedFamilyId === "ALL") {
        const promises = families.map(f => fetch(`/api/familias/${f.id}`).then(r => r.json()));
        setFamilyDetails(await Promise.all(promises));
      } else {
        const res = await fetch(`/api/familias/${selectedFamilyId}`);
        if(res.ok) setFamilyDetails([await res.json()]);
      }
    } catch { addToast("error","Erro ao carregar detalhes."); }
    finally { setLoadingDetails(false); }
  },[selectedFamilyId, families, addToast]);

  useEffect(() => { if(families.length > 0) fetchDetails(); },[fetchDetails, families.length]);

  function toggleField(key:string) {
    setSelectedFields(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  function exportPDF() {
    const content = previewRef.current;
    if(!content) return;
    const printWindow = window.open("","_blank");
    if(!printWindow) { addToast("error","Popup bloqueado. Permita popups para exportar."); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Relatório Instituto Mondó</title><style>
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
    setTimeout(() => { printWindow.print(); }, 500);
    addToast("success","PDF preparado para impressão!");
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    if(selectedFields.has("general")) {
      const data = familyDetails.map(f => ({
        "Nome": f.familyName, "Território": f.territory, "Endereço": f.address,
        "Status": f.status, "Data Cadastro": fmtDate(f.createdAt),
        ...(selectedFields.has("participationCount") ? {"Total Participações": f.participations.length} : {}),
        ...(selectedFields.has("observations") ? {"Observações": f.observations || "-"} : {}),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Famílias");
    }
    if(selectedFields.has("beneficiaries")) {
      const data = familyDetails.flatMap(f => f.beneficiaries.map(b => ({ "Família": f.familyName, "Nome": b.name, "Idade": b.age, "Papel": roleLabels[b.role]||b.role })));
      if(data.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Integrantes");
    }
    if(selectedFields.has("participationList")) {
      const data = familyDetails.flatMap(f => f.participations.map(p => ({ "Família": f.familyName, "Atividade": p.activity.title, "Tipo": p.activity.type==="ATENDIMENTO"?"Atendimento":"Atividade", "Formato": p.activity.format==="INDIVIDUAL"?"Individual":"Grupo", "Data": fmtDate(p.activity.date), "Participantes": p.participantCount, "Observações": p.notes || "-" })));
      if(data.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Participações");
    }
    XLSX.writeFile(wb, `relatorio_mondo_${new Date().toISOString().split("T")[0]}.xlsx`);
    addToast("success","Arquivo Excel baixado com sucesso!");
  }

  return (
    <div className="rp">
      <div className="toast-c">{toasts.map(t=>(<div key={t.id} className={`toast t-${t.type}`}>{t.type==="success"?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{t.message}</span><button className="toast-x" onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}><X size={12}/></button></div>))}</div>
      <div className="rp-header">
        <div><h1 className="rp-title">Relatórios</h1><p className="rp-sub">Exporte informações consolidadas das famílias</p></div>
        <div className="rp-export">
          <button className="rp-btn-pdf" onClick={exportPDF} disabled={loadingDetails||familyDetails.length===0}><Printer size={16}/>Exportar PDF</button>
          <button className="rp-btn-excel" onClick={exportExcel} disabled={loadingDetails||familyDetails.length===0}><FileSpreadsheet size={16}/>Exportar Excel</button>
        </div>
      </div>

      <div className="rp-config">
        <div className="rp-col">
          <h2 className="rp-sect">Filtros</h2>
          <div className="rp-field"><label className="rp-label">Família</label>
            <select value={selectedFamilyId} onChange={e=>setSelectedFamilyId(e.target.value)} className="rp-select" disabled={loading}>
              <option value="ALL">Todas as famílias</option>
              {families.map(f=>(<option key={f.id} value={f.id}>{f.familyName}</option>))}
            </select>
          </div>
          <h2 className="rp-sect" style={{marginTop:20}}>Campos do Relatório</h2>
          <div className="rp-fields">
            {REPORT_FIELDS.map(f=>(
              <label key={f.key} className={`rp-check ${selectedFields.has(f.key)?"active":""}`}>
                <div className={`ckbox ${selectedFields.has(f.key)?"ckd":""}`} onClick={()=>toggleField(f.key)}>{selectedFields.has(f.key)&&<Check size={14}/>}</div>
                <div><span className="ck-l">{f.label}</span><span className="ck-d">{f.desc}</span></div>
              </label>
            ))}
          </div>
        </div>
        <div className="rp-prev">
          <h2 className="rp-sect"><Eye size={16}/>Pré-visualização</h2>
          {loadingDetails ? (<div className="rp-loading"><Loader2 size={24} className="spinner"/><p>Carregando...</p></div>) : (
            <div ref={previewRef} className="rp-preview-content">
              {familyDetails.map(f=>(
                <div key={f.id} className="pf">
                  {selectedFields.has("general")&&(
                    <div className="pg">
                      <h2 className="pf-name">{f.familyName} <span className={`pb ${f.status==="ATIVA"?"pba":"pbi"}`}>{f.status}</span></h2>
                      <table className="pt"><tbody>
                        <tr><th>Território</th><td>{f.territory}</td></tr>
                        <tr><th>Endereço</th><td>{f.address}</td></tr>
                        <tr><th>Cadastro</th><td>{fmtDate(f.createdAt)}</td></tr>
                      </tbody></table>
                    </div>
                  )}
                  {selectedFields.has("participationCount")&&(<div className="ps"><span className="pst">{f.participations.length} participações registradas</span></div>)}
                  {selectedFields.has("beneficiaries")&&f.beneficiaries.length>0&&(
                    <div className="pb2"><h3 className="ph3">Integrantes ({f.beneficiaries.length})</h3><table className="pt"><thead><tr><th>Nome</th><th>Idade</th><th>Papel</th></tr></thead><tbody>{f.beneficiaries.map(b=>(<tr key={b.id}><td>{b.name}</td><td>{b.age}</td><td>{roleLabels[b.role]||b.role}</td></tr>))}</tbody></table></div>
                  )}
                  {selectedFields.has("participationList")&&f.participations.length>0&&(
                    <div className="pp"><h3 className="ph3">Ações Participadas ({f.participations.length})</h3><table className="pt"><thead><tr><th>Atividade</th><th>Tipo</th><th>Data</th><th>Part.</th></tr></thead><tbody>{f.participations.map(p=>(<tr key={p.id}><td>{p.activity.title}</td><td>{p.activity.type==="ATENDIMENTO"?"Atendimento":"Atividade"}</td><td>{fmtDate(p.activity.date)}</td><td>{p.participantCount}</td></tr>))}</tbody></table></div>
                  )}
                  {selectedFields.has("observations")&&f.observations&&(<div className="po"><h3 className="ph3">Observações</h3><p className="pot">{f.observations}</p></div>)}
                </div>
              ))}
              {familyDetails.length===0&&<p style={{textAlign:"center",padding:32,color:"#8B7355"}}>Nenhuma família encontrada.</p>}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .rp{max-width:1200px}.rp-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}.rp-title{font-size:28px;font-weight:700;color:#491B02;margin-bottom:4px}.rp-sub{font-size:14px;color:#8B7355}
        .rp-export{display:flex;gap:10px}.rp-btn-pdf,.rp-btn-excel{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}
        .rp-btn-pdf{background:linear-gradient(135deg,#C0272D,#D4444A);color:#FFF;box-shadow:0 2px 8px rgba(192,39,45,.25)}.rp-btn-pdf:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(192,39,45,.35)}.rp-btn-pdf:disabled{opacity:.5;cursor:not-allowed}
        .rp-btn-excel{background:linear-gradient(135deg,#6B7F3E,#7A9147);color:#FFF;box-shadow:0 2px 8px rgba(107,127,62,.25)}.rp-btn-excel:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(107,127,62,.35)}.rp-btn-excel:disabled{opacity:.5;cursor:not-allowed}
        .rp-config{display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start}.rp-col{background:#FFF;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(73,27,2,.06);position:sticky;top:88px}
        .rp-sect{font-size:14px;font-weight:700;color:#491B02;margin-bottom:14px;display:flex;align-items:center;gap:6px}.rp-field{margin-bottom:12px}.rp-label{display:block;font-size:12px;font-weight:600;color:#8B7355;margin-bottom:4px;text-transform:uppercase;letter-spacing:.3px}
        .rp-select{width:100%;padding:10px 14px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-family:inherit;color:#491B02;background:#FEFBF7;outline:none;transition:all .2s;cursor:pointer}.rp-select:focus{border-color:#C9943E;box-shadow:0 0 0 3px rgba(201,148,62,.1)}
        .rp-fields{display:flex;flex-direction:column;gap:8px}.rp-check{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all .2s;border:1px solid #F0E6D8;background:#FEFBF7}.rp-check:hover{border-color:#C9943E40}.rp-check.active{border-color:#6B7F3E60;background:#6B7F3E08}
        .ckbox{width:20px;height:20px;border-radius:5px;border:2px solid #E8D5C0;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;margin-top:2px}.ckd{background:#6B7F3E;border-color:#6B7F3E;color:#FFF}
        .ck-l{display:block;font-size:13px;font-weight:600;color:#491B02}.ck-d{font-size:11px;color:#8B7355;margin-top:2px;display:block}
        .rp-prev{background:#FFF;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(73,27,2,.06);min-height:400px}.rp-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px;color:#8B7355}
        .rp-preview-content{display:flex;flex-direction:column;gap:20px}
        .pf{border:1px solid #F0E6D8;border-radius:10px;padding:16px;page-break-inside:avoid}.pf-name{font-size:17px;font-weight:700;color:#491B02;margin-bottom:10px;display:flex;align-items:center;gap:8px}.pb{padding:3px 8px;border-radius:12px;font-size:10px;font-weight:600}.pba{background:#ECFDF5;color:#059669}.pbi{background:#FEF2F2;color:#DC2626}
        .pt{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:13px}.pt th,.pt td{padding:6px 10px;text-align:left;border:1px solid #F0E6D8}.pt th{background:#FDF6ED;font-weight:600;color:#491B02;font-size:12px}
        .ps{margin-bottom:8px}.pst{display:inline-block;padding:4px 12px;background:#ECFDF5;border-radius:20px;font-weight:600;color:#059669;font-size:13px}.ph3{font-size:14px;font-weight:700;color:#6B3A1F;margin-bottom:8px}.po{margin-top:8px}.pot{padding:8px 12px;background:#FDF6ED;border-radius:6px;font-size:13px;color:#6B3A1F;line-height:1.5;font-style:italic}
        .toast-c{position:fixed;top:76px;right:24px;z-index:60;display:flex;flex-direction:column;gap:8px;pointer-events:none}.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(73,27,2,.12);pointer-events:auto;animation:ts .3s ease;min-width:280px}.t-success{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0}.t-error{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}.toast-x{margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;opacity:.6;padding:2px}@keyframes ts{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        :global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){.rp-config{grid-template-columns:1fr}.rp-col{position:static}}
      `}</style>
    </div>
  );
}
