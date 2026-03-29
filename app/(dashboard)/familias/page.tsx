"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, MapPin, ChevronRight, Search, X, Loader2, CheckCircle2, AlertCircle, Filter } from "lucide-react";

interface Family { id: string; familyName: string; territory: string; address: string; status: string; observations: string | null; createdAt: string; membersCount?: number; participationsCount?: number; }
interface Toast { id: number; type: "success" | "error"; message: string; }

export default function FamiliasPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formName, setFormName] = useState("");
  const [formTerritory, setFormTerritory] = useState("");
  const [formAddress, setFormAddress] = useState("");
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
    } catch { addToast("error", "Erro ao carregar famílias."); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const filtered = families.filter((f) => {
    const ms = f.familyName.toLowerCase().includes(search.toLowerCase()) || f.territory.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "TODOS" || f.status === statusFilter;
    return ms && mf;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/familias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ familyName: formName, territory: formTerritory, address: formAddress, observations: formObs || null }) });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setFamilies((p) => [...p, { ...created, membersCount: 0, participationsCount: 0 }]);
      setShowModal(false);
      setFormName(""); setFormTerritory(""); setFormAddress(""); setFormObs("");
      addToast("success", `Família "${created.familyName}" cadastrada!`);
    } catch (err) { addToast("error", err instanceof Error ? err.message : "Erro ao criar família"); }
    finally { setIsSubmitting(false); }
  }

  return (
    <div className="fp">
      <div className="toast-c">{toasts.map((t) => (<div key={t.id} className={`toast t-${t.type}`}>{t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}<span>{t.message}</span><button className="toast-x" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X size={12} /></button></div>))}</div>

      <div className="fp-header">
        <div><h1 className="fp-title">Famílias</h1><p className="fp-sub">Gerencie as famílias acompanhadas pelo Instituto</p></div>
        <button className="fp-btn-add" onClick={() => setShowModal(true)} id="btn-nova-familia-page"><Plus size={16} />Nova Família</button>
      </div>

      <div className="fp-filters">
        <div className="fp-search-wrap"><Search size={16} className="fp-search-icon" /><input placeholder="Buscar por nome ou território..." value={search} onChange={(e) => setSearch(e.target.value)} className="fp-search" id="filter-search-familia" /></div>
        <div className="fp-filter-group"><Filter size={14} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="fp-filter-select"><option value="TODOS">Todos os status</option><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></div>
      </div>

      {loading ? (<div className="fp-loading"><Loader2 size={32} className="spinner" /><p>Carregando famílias...</p></div>) : (
        <div className="fp-grid">
          {filtered.map((f) => (
            <Link key={f.id} href={`/familias/${f.id}`} className="fc" id={`familia-card-${f.id}`}>
              <div className="fc-head"><h3 className="fc-name">{f.familyName}</h3><span className={`fc-status ${f.status === "ATIVA" ? "st-a" : "st-i"}`}>{f.status === "ATIVA" ? "Ativa" : "Inativa"}</span></div>
              <div className="fc-info"><div className="fc-row"><MapPin size={14} /><span>{f.territory}</span></div><div className="fc-row"><Users size={14} /><span>{f.membersCount ?? 0} integrantes • {f.participationsCount ?? 0} participações</span></div></div>
              <div className="fc-foot"><span className="fc-view">Ver histórico</span><ChevronRight size={16} /></div>
            </Link>
          ))}
          {filtered.length === 0 && !loading && (<div className="fp-empty"><Users size={40} /><p>Nenhuma família encontrada.</p><button className="fp-btn-empty" onClick={() => setShowModal(true)}><Plus size={16} />Cadastrar Família</button></div>)}
        </div>
      )}

      {showModal && (
        <div className="modal-ov" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="modal-c" onClick={(e) => e.stopPropagation()}>
            <div className="modal-h"><h2>Nova Família</h2><button className="modal-x" onClick={() => setShowModal(false)} disabled={isSubmitting}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="modal-f">
              <div className="ff"><label className="fl">Nome da Família *</label><input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex.: Silva Santos" className="fi" required disabled={isSubmitting} autoFocus /></div>
              <div className="ff"><label className="fl">Território *</label><input value={formTerritory} onChange={(e) => setFormTerritory(e.target.value)} placeholder="Ex.: Comunidade São José" className="fi" required disabled={isSubmitting} /></div>
              <div className="ff"><label className="fl">Endereço *</label><input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Ex.: Rua das Flores, 123" className="fi" required disabled={isSubmitting} /></div>
              <div className="ff"><label className="fl">Observações</label><textarea value={formObs} onChange={(e) => setFormObs(e.target.value)} placeholder="Informações adicionais..." className="ft" rows={3} disabled={isSubmitting} /></div>
              <div className="fa"><button type="button" className="btn-c" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button><button type="submit" className="btn-s" disabled={isSubmitting}>{isSubmitting ? <span className="btn-l"><Loader2 size={16} className="spinner" />Cadastrando...</span> : "Cadastrar Família"}</button></div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .fp{max-width:1100px}.fp-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}.fp-title{font-size:28px;font-weight:700;color:#491B02;margin-bottom:4px}.fp-sub{font-size:14px;color:#8B7355}
        .fp-btn-add{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:linear-gradient(135deg,#C0272D,#D4444A);color:#FFF;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(192,39,45,.25);transition:all .2s;white-space:nowrap}.fp-btn-add:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(192,39,45,.35)}
        .fp-filters{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}.fp-search-wrap{position:relative;flex:1;min-width:240px}.fp-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355;pointer-events:none}.fp-search{width:100%;padding:10px 12px 10px 36px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-family:inherit;color:#491B02;background:#FFF;outline:none;transition:border-color .2s}.fp-search::placeholder{color:#C9943E80}.fp-search:focus{border-color:#C9943E;box-shadow:0 0 0 3px rgba(201,148,62,.1)}
        .fp-filter-group{display:flex;align-items:center;gap:6px;padding:0 4px 0 10px;border:1.5px solid #E8D5C0;border-radius:8px;background:#FFF;color:#6B3A1F}.fp-filter-select{padding:9px 8px;border:none;font-size:13px;font-family:inherit;color:#491B02;background:transparent;outline:none;cursor:pointer;min-width:120px}
        .fp-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px;color:#8B7355}.fp-loading p{font-size:14px}:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        .fp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
        .fc{background:#FFF;border-radius:12px;padding:20px;text-decoration:none;box-shadow:0 1px 3px rgba(73,27,2,.06);border:1px solid transparent;transition:all .2s;display:block}.fc:hover{border-color:#C9943E40;box-shadow:0 4px 12px rgba(73,27,2,.1);transform:translateY(-2px)}.fc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.fc-name{font-size:17px;font-weight:700;color:#491B02}.fc-status{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}.st-a{background:#ECFDF5;color:#059669}.st-i{background:#FEF2F2;color:#DC2626}.fc-info{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}.fc-row{display:flex;align-items:center;gap:8px;font-size:13px;color:#6B3A1F}.fc-foot{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid #F0E6D8}.fc-view{font-size:13px;font-weight:600;color:#C9943E}.fc-foot :global(svg){color:#C9943E}
        .fp-empty{text-align:center;padding:60px 20px;color:#8B7355;display:flex;flex-direction:column;align-items:center;gap:12px;background:#FFF;border-radius:12px;box-shadow:0 1px 3px rgba(73,27,2,.06)}.fp-empty p{font-size:15px}.fp-btn-empty{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#009999;color:#FFF;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.fp-btn-empty:hover{background:#007777}
        .toast-c{position:fixed;top:76px;right:24px;z-index:60;display:flex;flex-direction:column;gap:8px;pointer-events:none}.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(73,27,2,.12);pointer-events:auto;animation:ts .3s ease;min-width:280px}.t-success{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0}.t-error{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}.toast-x{margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;opacity:.6;padding:2px}.toast-x:hover{opacity:1}@keyframes ts{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .modal-ov{position:fixed;inset:0;background:rgba(73,27,2,.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;animation:fi .2s ease}@keyframes fi{from{opacity:0}to{opacity:1}}.modal-c{width:100%;max-width:520px;background:#FFF;border-radius:16px;box-shadow:0 20px 60px rgba(73,27,2,.15);animation:ms .25s ease;max-height:85vh;overflow-y:auto}@keyframes ms{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}.modal-h{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #F0E6D8}.modal-h h2{font-size:18px;font-weight:700;color:#491B02}.modal-x{width:32px;height:32px;border-radius:8px;border:none;background:transparent;color:#8B7355;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}.modal-x:hover{background:#F8E4CC;color:#491B02}
        .modal-f{padding:24px;display:flex;flex-direction:column;gap:18px}.ff{display:flex;flex-direction:column;gap:6px}.fl{font-size:13px;font-weight:600;color:#491B02}.fi,.ft{padding:10px 14px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-family:inherit;color:#491B02;background:#FEFBF7;outline:none;transition:all .2s}.ft{resize:vertical;min-height:80px}.fi:focus,.ft:focus{border-color:#C9943E;box-shadow:0 0 0 3px rgba(201,148,62,.1)}.fi::placeholder,.ft::placeholder{color:#C9943E80}.fi:disabled,.ft:disabled{opacity:.6;cursor:not-allowed}
        .fa{display:flex;gap:10px;justify-content:flex-end;padding-top:8px;border-top:1px solid #F0E6D8}.btn-c{padding:10px 20px;background:transparent;color:#6B3A1F;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.btn-c:hover{background:#F8E4CC;border-color:#C9943E}.btn-c:disabled{opacity:.5;cursor:not-allowed}.btn-s{padding:10px 24px;background:linear-gradient(135deg,#6B7F3E,#7A9147);color:#FFF;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(107,127,62,.3);transition:all .2s}.btn-s:hover:not(:disabled){background:linear-gradient(135deg,#5F7136,#6B7F3E);transform:translateY(-1px)}.btn-s:disabled{opacity:.7;cursor:not-allowed}.btn-l{display:flex;align-items:center;gap:6px}
      `}</style>
    </div>
  );
}
