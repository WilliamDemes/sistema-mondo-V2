"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Plus, ChevronDown, Eye, Trash2, MapPin, Home, Calendar, Hash, X, Loader2, CheckCircle2, AlertCircle, User } from "lucide-react";

type FamilyStatus = "ATIVA"|"INATIVA"; type BeneficiaryRole = "PAI"|"MAE"|"FILHO"|"FILHA"|"AVO"|"OUTRO";
interface Activity { id:string; title:string; description:string|null; type:string; format:string; date:string; }
interface Participation { id:string; familyId:string; activityId:string; participantCount:number; notes:string|null; activity:Activity; }
interface Beneficiary { id:string; familyId:string; name:string; age:number; role:BeneficiaryRole; }
interface FamilyDetail { id:string; familyName:string; territory:string; address:string; status:FamilyStatus; observations:string|null; createdAt:string; beneficiaries:Beneficiary[]; participations:Participation[]; }
interface Toast { id:number; type:"success"|"error"; message:string; }

const roleLabels: Record<string,string> = { PAI:"Pai", MAE:"Mãe", FILHO:"Filho", FILHA:"Filha", AVO:"Avó/Avô", OUTRO:"Outro" };
function fmtDate(d:string){ return new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}); }

export default function FamilyHistoryPage() {
  const { id } = useParams<{id:string}>();
  const [family, setFamily] = useState<FamilyDetail|null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edit form
  const [eName, setEName] = useState(""); const [eTerritory, setETerritory] = useState(""); const [eAddress, setEAddress] = useState(""); const [eObs, setEObs] = useState(""); const [eStatus, setEStatus] = useState<FamilyStatus>("ATIVA");
  // Action form
  const [aActivityId, setAActivityId] = useState(""); const [aCount, setACount] = useState("1"); const [aNotes, setANotes] = useState("");
  // Member form
  const [mName, setMName] = useState(""); const [mAge, setMAge] = useState(""); const [mRole, setMRole] = useState<BeneficiaryRole>("FILHO");

  const addToast = useCallback((type:"success"|"error",message:string) => {
    const tid = Date.now(); setToasts(p=>[...p,{id:tid,type,message}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==tid)),4000);
  },[]);

  const fetchFamily = useCallback(async () => {
    try {
      const res = await fetch(`/api/familias/${id}`);
      if (!res.ok) throw new Error();
      setFamily(await res.json());
    } catch { addToast("error","Erro ao carregar família."); }
    finally { setLoading(false); }
  },[id,addToast]);

  const fetchActivities = useCallback(async () => {
    try { const res = await fetch("/api/atividades"); if(res.ok) setActivities(await res.json()); } catch {/* ignore */}
  },[]);

  useEffect(() => { fetchFamily(); fetchActivities(); },[fetchFamily,fetchActivities]);

  function openEditModal() {
    if(!family) return;
    setEName(family.familyName); setETerritory(family.territory); setEAddress(family.address); setEObs(family.observations||""); setEStatus(family.status);
    setShowEditModal(true);
  }

  async function handleEditSubmit(e:React.FormEvent) {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({familyName:eName,territory:eTerritory,address:eAddress,observations:eObs||null,status:eStatus})});
      if(!res.ok) throw new Error();
      const updated = await res.json();
      setFamily(f => f ? {...f,...updated} : f);
      setShowEditModal(false); addToast("success","Família atualizada com sucesso!");
    } catch { addToast("error","Erro ao atualizar família."); }
    finally { setIsSubmitting(false); }
  }

  async function handleActionSubmit(e:React.FormEvent) {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}/participacoes`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activityId:aActivityId,participantCount:Number(aCount),notes:aNotes||null})});
      if(!res.ok) throw new Error((await res.json()).error);
      setShowActionModal(false); setAActivityId(""); setACount("1"); setANotes("");
      addToast("success","Ação registrada com sucesso!");
      await fetchFamily();
    } catch(err) { addToast("error", err instanceof Error ? err.message : "Erro ao registrar ação."); }
    finally { setIsSubmitting(false); }
  }

  async function handleMemberSubmit(e:React.FormEvent) {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch(`/api/familias/${id}/beneficiarios`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:mName,age:Number(mAge),role:mRole})});
      if(!res.ok) throw new Error();
      const created = await res.json();
      setFamily(f => f ? {...f, beneficiaries:[...f.beneficiaries, created]} : f);
      setShowMemberModal(false); setMName(""); setMAge(""); setMRole("FILHO");
      addToast("success",`Integrante "${created.name}" adicionado!`);
    } catch { addToast("error","Erro ao adicionar integrante."); }
    finally { setIsSubmitting(false); }
  }

  if(loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:60,color:"#8B7355",flexDirection:"column",gap:12}}><Loader2 size={32} className="spinner" /><p>Carregando família...</p><style>{`:global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(!family) return <div style={{padding:40,textAlign:"center"}}><h2>Família não encontrada</h2><Link href="/familias">Voltar</Link></div>;

  const lastP = family.participations[0];

  return (
    <div className="hp">
      <div className="toast-c">{toasts.map(t=>(<div key={t.id} className={`toast t-${t.type}`}>{t.type==="success"?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{t.message}</span><button className="toast-x" onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}><X size={12}/></button></div>))}</div>

      <div className="hp-head">
        <Link href="/familias" className="hp-back"><ArrowLeft size={18}/>Voltar</Link>
        <div className="hp-acts">
          <button className="hp-btn-out" onClick={openEditModal} id="btn-editar-familia"><Edit3 size={16}/>Editar Família</button>
          <button className="hp-btn-pri" onClick={()=>{setAActivityId(activities[0]?.id||"");setShowActionModal(true)}} id="btn-registrar-acao"><Plus size={16}/>Registrar Ação</button>
        </div>
      </div>
      <h1 className="hp-title">{family.familyName}</h1>
      <p className="hp-sub">Acompanhamento e histórico de participações</p>

      <div className="hp-grid">
        <div className="hp-left">
          {/* Summary */}
          <section className="hc">
            <div className="hc-h"><h2 className="hc-t">Resumo</h2><span className={`sb ${family.status==="ATIVA"?"sa":"si"}`}>{family.status==="ATIVA"?"Ativa":"Inativa"}</span></div>
            <div className="sg">
              <div className="si2"><div className="sil"><MapPin size={14}/>Território</div><span className="siv">{family.territory}</span></div>
              <div className="si2"><div className="sil"><Home size={14}/>Endereço</div><span className="siv">{family.address}</span></div>
              <div className="si2"><div className="sil"><Calendar size={14}/>Último registro</div><span className="siv">{lastP ? fmtDate(lastP.activity.date) : "---"}</span></div>
              <div className="si2"><div className="sil"><Hash size={14}/>Total de participações</div><span className="siv svh">{family.participations.length}</span></div>
            </div>
          </section>
          {/* Timeline */}
          <section className="hc">
            <div className="hc-h"><h2 className="hc-t">Linha do Tempo</h2><span className="th">Total: {family.participations.length}</span></div>
            <div className="tl">
              {family.participations.map((p,i)=>{
                const isA = p.activity.type==="ATENDIMENTO";
                return(
                  <div key={p.id} className="ti">
                    <div className="tc2"><div className="td" style={{background:isA?"#6B7F3E":"#C9943E"}}/>{i<family.participations.length-1&&<div className="tln"/>}</div>
                    <div className="tco">
                      <div className="tch"><div><span className="tdt">{fmtDate(p.activity.date)}</span><h3 className="tt2">{p.activity.title}</h3></div><div className="tgs"><span className={`tg ${isA?"tga":"tgv"}`}>{isA?"Atendimento":"Atividade"}</span><span className="tg tgf">{p.activity.format==="INDIVIDUAL"?"Individual":"Grupo"}</span></div></div>
                      {p.activity.description&&<p className="tds">{p.activity.description}</p>}
                      <div className="tfo"><span className="tp2">Participantes: {p.participantCount}</span>{p.notes&&<span className="tn">Obs: {p.notes}</span>}</div>
                    </div>
                  </div>
                );
              })}
              {family.participations.length===0&&<div className="te"><p>Nenhuma participação registrada.</p><button className="te-btn" onClick={()=>setShowActionModal(true)}><Plus size={14}/>Registrar primeira ação</button></div>}
            </div>
          </section>
        </div>
        <div className="hp-right">
          {/* Members */}
          <section className="hc">
            <div className="hc-h"><h2 className="hc-t">Integrantes</h2><button className="bp" onClick={()=>setShowMemberModal(true)} id="btn-add-integrante"><Plus size={14}/>Adicionar</button></div>
            <div className="ml">
              {family.beneficiaries.map(m=>(
                <div key={m.id} className="mi">
                  <div className="ma" style={{background:m.role==="PAI"||m.role==="FILHO"?"linear-gradient(135deg,#6B7F3E,#7A9147)":m.role==="MAE"||m.role==="FILHA"?"linear-gradient(135deg,#C0272D,#D4444A)":"linear-gradient(135deg,#C9943E,#D4A855)"}}>{m.name.charAt(0)}</div>
                  <div className="mf"><span className="mn">{m.name}</span><span className="md">{m.age} anos • {roleLabels[m.role]||m.role}</span></div>
                </div>
              ))}
            </div>
          </section>
          <section className="hc ho"><h2 className="hc-t">Observações</h2><p className="ot">{family.observations||"Nenhuma observação registrada."}</p></section>
        </div>
      </div>

      {/* Edit Family Modal */}
      {showEditModal&&(<div className="mov" onClick={()=>!isSubmitting&&setShowEditModal(false)}><div className="mc" onClick={e=>e.stopPropagation()}>
        <div className="mh"><h2>Editar Família</h2><button className="mx" onClick={()=>setShowEditModal(false)} disabled={isSubmitting}><X size={20}/></button></div>
        <form onSubmit={handleEditSubmit} className="mfo">
          <div className="ff"><label className="fl">Nome *</label><input value={eName} onChange={e=>setEName(e.target.value)} className="fin" required disabled={isSubmitting}/></div>
          <div className="ff"><label className="fl">Território *</label><input value={eTerritory} onChange={e=>setETerritory(e.target.value)} className="fin" required disabled={isSubmitting}/></div>
          <div className="ff"><label className="fl">Endereço *</label><input value={eAddress} onChange={e=>setEAddress(e.target.value)} className="fin" required disabled={isSubmitting}/></div>
          <div className="ff"><label className="fl">Status</label><select value={eStatus} onChange={e=>setEStatus(e.target.value as FamilyStatus)} className="fin" disabled={isSubmitting}><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></div>
          <div className="ff"><label className="fl">Observações</label><textarea value={eObs} onChange={e=>setEObs(e.target.value)} className="fta" rows={3} disabled={isSubmitting}/></div>
          <div className="fac"><button type="button" className="bc" onClick={()=>setShowEditModal(false)} disabled={isSubmitting}>Cancelar</button><button type="submit" className="bs" disabled={isSubmitting}>{isSubmitting?<span className="bl"><Loader2 size={16} className="spinner"/>Salvando...</span>:"Salvar Alterações"}</button></div>
        </form>
      </div></div>)}

      {/* Register Action Modal */}
      {showActionModal&&(<div className="mov" onClick={()=>!isSubmitting&&setShowActionModal(false)}><div className="mc" onClick={e=>e.stopPropagation()}>
        <div className="mh"><h2>Registrar Ação</h2><button className="mx" onClick={()=>setShowActionModal(false)} disabled={isSubmitting}><X size={20}/></button></div>
        <form onSubmit={handleActionSubmit} className="mfo">
          <div className="ff"><label className="fl">Atividade *</label><select value={aActivityId} onChange={e=>setAActivityId(e.target.value)} className="fin" required disabled={isSubmitting}>
            <option value="">Selecione uma atividade...</option>
            {activities.map(a=>(<option key={a.id} value={a.id}>{a.title} ({a.type==="ATENDIMENTO"?"Atendimento":"Atividade"} - {fmtDate(a.date)})</option>))}
          </select></div>
          <div className="ff"><label className="fl">Nº de Participantes *</label><input type="number" min="1" value={aCount} onChange={e=>setACount(e.target.value)} className="fin" required disabled={isSubmitting}/></div>
          <div className="ff"><label className="fl">Observações</label><textarea value={aNotes} onChange={e=>setANotes(e.target.value)} placeholder="Detalhes adicionais..." className="fta" rows={2} disabled={isSubmitting}/></div>
          <div className="fac"><button type="button" className="bc" onClick={()=>setShowActionModal(false)} disabled={isSubmitting}>Cancelar</button><button type="submit" className="bs" disabled={isSubmitting}>{isSubmitting?<span className="bl"><Loader2 size={16} className="spinner"/>Registrando...</span>:"Registrar Ação"}</button></div>
        </form>
      </div></div>)}

      {/* Add Member Modal */}
      {showMemberModal&&(<div className="mov" onClick={()=>!isSubmitting&&setShowMemberModal(false)}><div className="mc" onClick={e=>e.stopPropagation()}>
        <div className="mh"><h2>Adicionar Integrante</h2><button className="mx" onClick={()=>setShowMemberModal(false)} disabled={isSubmitting}><X size={20}/></button></div>
        <form onSubmit={handleMemberSubmit} className="mfo">
          <div className="ff"><label className="fl">Nome *</label><input value={mName} onChange={e=>setMName(e.target.value)} placeholder="Nome completo" className="fin" required disabled={isSubmitting} autoFocus/></div>
          <div className="fr2">
            <div className="ff"><label className="fl">Idade *</label><input type="number" min="0" value={mAge} onChange={e=>setMAge(e.target.value)} className="fin" required disabled={isSubmitting}/></div>
            <div className="ff"><label className="fl">Papel *</label><select value={mRole} onChange={e=>setMRole(e.target.value as BeneficiaryRole)} className="fin" disabled={isSubmitting}><option value="PAI">Pai</option><option value="MAE">Mãe</option><option value="FILHO">Filho</option><option value="FILHA">Filha</option><option value="AVO">Avó/Avô</option><option value="OUTRO">Outro</option></select></div>
          </div>
          <div className="fac"><button type="button" className="bc" onClick={()=>setShowMemberModal(false)} disabled={isSubmitting}>Cancelar</button><button type="submit" className="bs" disabled={isSubmitting}>{isSubmitting?<span className="bl"><Loader2 size={16} className="spinner"/>Adicionando...</span>:"Adicionar Integrante"}</button></div>
        </form>
      </div></div>)}

      <style jsx>{`
        .hp{max-width:1200px}
        .hp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.hp-back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:500;color:#6B3A1F;text-decoration:none;transition:color .2s}.hp-back:hover{color:#491B02}.hp-acts{display:flex;gap:10px}
        .hp-btn-out{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:transparent;color:#C0272D;border:2px solid #C0272D;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.hp-btn-out:hover{background:#C0272D;color:#FDF6ED}
        .hp-btn-pri{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#C9943E,#D4A855);color:#FFF;border:none;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(201,148,62,.3)}.hp-btn-pri:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(201,148,62,.4)}
        .hp-title{font-size:28px;font-weight:700;color:#491B02;margin-bottom:4px}.hp-sub{font-size:14px;color:#8B7355;margin-bottom:24px}
        .hp-grid{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}.hp-left{display:flex;flex-direction:column;gap:20px}.hp-right{display:flex;flex-direction:column;gap:20px;position:sticky;top:88px}
        .hc{background:#FFF;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(73,27,2,.06)}.hc-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.hc-t{font-size:18px;font-weight:700;color:#491B02}
        .sb{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.sa{background:#ECFDF5;color:#059669}.si{background:#FEF2F2;color:#DC2626}
        .sg{display:grid;grid-template-columns:1fr 1fr;gap:12px}.si2{background:#FEFBF7;border-radius:8px;padding:12px 16px;border:1px solid #F0E6D8}.sil{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}.siv{font-size:15px;font-weight:600;color:#491B02}.svh{font-size:20px;font-weight:800;color:#C9943E}
        .th{font-size:12px;color:#C9943E;font-weight:500}.tl{display:flex;flex-direction:column}.ti{display:flex;gap:16px}.tc2{display:flex;flex-direction:column;align-items:center;padding-top:6px}.td{width:12px;height:12px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 3px #FFF,0 0 0 4px #E8D5C0}.tln{width:2px;flex:1;background:#E8D5C0;margin:4px 0}
        .tco{flex:1;background:#FEFBF7;border-radius:10px;padding:16px;margin-bottom:16px;border:1px solid #F0E6D8;transition:all .2s}.tco:hover{border-color:#C9943E40;box-shadow:0 2px 8px rgba(73,27,2,.06)}.tch{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}.tdt{font-size:12px;color:#8B7355;font-weight:500}.tt2{font-size:16px;font-weight:700;color:#491B02;margin-top:2px}
        .tgs{display:flex;gap:6px;flex-shrink:0}.tg{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;border:1.5px solid;white-space:nowrap}.tga{color:#6B7F3E;border-color:#6B7F3E;background:#6B7F3E10}.tgv{color:#C9943E;border-color:#C9943E;background:#C9943E10}.tgf{color:#491B02;border-color:#491B0230;background:#491B0208}
        .tds{font-size:14px;color:#6B3A1F;line-height:1.5;margin-bottom:12px}.tfo{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}.tp2{font-size:13px;font-weight:600;color:#491B02}.tn{font-size:12px;color:#8B7355;font-style:italic}
        .te{text-align:center;padding:32px;color:#8B7355;font-size:14px;display:flex;flex-direction:column;align-items:center;gap:12px}.te-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;background:#009999;color:#FFF;border:none;border-radius:6px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.te-btn:hover{background:#007777}
        .bp{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#009999;color:#FFF;border:none;border-radius:6px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.bp:hover{background:#007777;transform:translateY(-1px)}
        .ml{display:flex;flex-direction:column;gap:8px}.mi{display:flex;align-items:center;gap:12px;padding:10px 12px;background:#FEFBF7;border-radius:10px;border:1px solid #F0E6D8;transition:all .2s}.mi:hover{border-color:#C9943E40;box-shadow:0 2px 8px rgba(73,27,2,.06)}.ma{width:38px;height:38px;border-radius:50%;color:#FFF;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0}.mf{flex:1;display:flex;flex-direction:column}.mn{font-size:14px;font-weight:600;color:#491B02}.md{font-size:12px;color:#8B7355}
        .ho{background:#FDF6ED;border:1px solid #F0E6D8}.ot{font-size:14px;color:#6B3A1F;line-height:1.6;margin-top:8px}
        .toast-c{position:fixed;top:76px;right:24px;z-index:60;display:flex;flex-direction:column;gap:8px;pointer-events:none}.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(73,27,2,.12);pointer-events:auto;animation:ts .3s ease;min-width:280px}.t-success{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0}.t-error{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}.toast-x{margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;opacity:.6;padding:2px}.toast-x:hover{opacity:1}@keyframes ts{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        :global(.spinner){animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        .mov{position:fixed;inset:0;background:rgba(73,27,2,.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;animation:fi .2s ease}@keyframes fi{from{opacity:0}to{opacity:1}}.mc{width:100%;max-width:520px;background:#FFF;border-radius:16px;box-shadow:0 20px 60px rgba(73,27,2,.15);animation:msl .25s ease;max-height:85vh;overflow-y:auto}@keyframes msl{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}.mh{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #F0E6D8}.mh h2{font-size:18px;font-weight:700;color:#491B02}.mx{width:32px;height:32px;border-radius:8px;border:none;background:transparent;color:#8B7355;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}.mx:hover{background:#F8E4CC;color:#491B02}
        .mfo{padding:24px;display:flex;flex-direction:column;gap:18px}.ff{display:flex;flex-direction:column;gap:6px;flex:1}.fl{font-size:13px;font-weight:600;color:#491B02}.fin,.fta{padding:10px 14px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-family:inherit;color:#491B02;background:#FEFBF7;outline:none;transition:all .2s}.fta{resize:vertical;min-height:60px}.fin:focus,.fta:focus{border-color:#C9943E;box-shadow:0 0 0 3px rgba(201,148,62,.1)}.fin::placeholder,.fta::placeholder{color:#C9943E80}.fin:disabled,.fta:disabled{opacity:.6;cursor:not-allowed}
        .fr2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.fac{display:flex;gap:10px;justify-content:flex-end;padding-top:8px;border-top:1px solid #F0E6D8}.bc{padding:10px 20px;background:transparent;color:#6B3A1F;border:1.5px solid #E8D5C0;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}.bc:hover{background:#F8E4CC;border-color:#C9943E}.bc:disabled{opacity:.5;cursor:not-allowed}.bs{padding:10px 24px;background:linear-gradient(135deg,#6B7F3E,#7A9147);color:#FFF;border:none;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(107,127,62,.3);transition:all .2s}.bs:hover:not(:disabled){background:linear-gradient(135deg,#5F7136,#6B7F3E);transform:translateY(-1px)}.bs:disabled{opacity:.7;cursor:not-allowed}.bl{display:flex;align-items:center;gap:6px}
        @media(max-width:1024px){.hp-grid{grid-template-columns:1fr}.hp-right{position:static}}
      `}</style>
    </div>
  );
}
