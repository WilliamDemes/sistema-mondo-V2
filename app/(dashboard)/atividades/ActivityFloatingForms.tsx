"use client";

import React, { useState } from "react";
import { 
  Plus, 
  X, 
  Trophy, 
  Gift, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Package, 
  MessageCircle, 
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import styles from "./ActivityFloatingForms.module.css";

const ACTIVITY_TYPES = [
  { id: "PREMIACAO", name: "Premiação", icon: Trophy, desc: "Celebração e entrega de prêmios" },
  { id: "DOACAO", name: "Doação", icon: Gift, desc: "Recursos e materiais recebidos" },
  { id: "VISITA", name: "Visita Externa", icon: MapPin, desc: "Exploração de outros espaços" },
  { id: "CONSULTORIA", name: "Consultoria", icon: Briefcase, desc: "Apoio e mentoria técnica" },
  { id: "CURSO", name: "Curso", icon: GraduationCap, desc: "Formação e capacitação longa" },
  { id: "INSTITUCIONAL", name: "Institucional", icon: Building, desc: "Reuniões e pautas internas" },
  { id: "PRODUTO", name: "Produto", icon: Package, desc: "Itens desenvolvidos/armazenados" },
  { id: "RODA", name: "Roda de Conversa", icon: MessageCircle, desc: "Diálogos sobre temas sociais" },
  { id: "ATENDIMENTO", name: "Atendimento", icon: HeartHandshake, desc: "Suporte assistencial primário" }
] as const;

type ActivityId = typeof ACTIVITY_TYPES[number]["id"];

export function ActivityFloatingForms() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityId | null>(null);
  const [showToast, setShowToast] = useState(false);

  const closeAll = () => {
    setIsOpen(false);
    setSelectedType(null);
  };

  const handleFakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      closeAll();
    }, 2500);
  };

  // Renderiza formulário diferente baseado na escolha
  const renderFormContent = () => {
    switch (selectedType) {
      case "PREMIACAO": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Título da Premiação *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Medalha de Ouro Atleta..." />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Valor ou Categoria</label>
              <input type="text" className={styles.input} placeholder="Ex: R$ 5.000 ou Eletrônico" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data do Evento *</label>
              <input required type="date" className={styles.input} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ganhadores Principais</label>
            <textarea className={styles.textarea} placeholder="Descreva os recebedores do prêmio..." />
          </div>
        </>
      );
      case "DOACAO": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Instituição / Parceiro Doador *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Supermercado Assaí" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Item Doado *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Cestas Básicas" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quantidade</label>
              <input required type="number" className={styles.input} min="1" placeholder="100" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Unidade de Medida</label>
              <select className={styles.select}>
                <option>Unidades</option>
                <option>Cestas</option>
                <option>Kilos (Kg)</option>
                <option>Litros</option>
              </select>
            </div>
          </div>
        </>
      );
      case "VISITA": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ponto Visitado *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Fábrica da Natura" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Equipe Representante</label>
              <input type="text" className={styles.input} placeholder="João, Maria..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data</label>
              <input required type="date" className={styles.input} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Objetivo e Resultados da Visita</label>
            <textarea className={styles.textarea} placeholder="Qual foi a pauta central explorada?" />
          </div>
        </>
      );
      case "CONSULTORIA": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Consultor ou Empresa *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Sebrae" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Área de Foco</label>
              <select className={styles.select}>
                <option>Gestão Financeira</option>
                <option>Marketing Educacional</option>
                <option>Capacitação Social</option>
                <option>Suporte Psicológico</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Duração (Horas/Dias)</label>
              <input required type="text" className={styles.input} placeholder="Ex: 4 horas" />
            </div>
          </div>
        </>
      );
      case "CURSO": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Módulo ou Título do Curso *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Curso de Culinária Básica" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome do Mestre/Instrutor</label>
              <input type="text" className={styles.input} placeholder="Fulano de Tal" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Vagas Totais</label>
              <input required type="number" className={styles.input} placeholder="Ex: 25" min="1" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Início</label>
              <input required type="date" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fim Previsto</label>
              <input required type="date" className={styles.input} />
            </div>
          </div>
        </>
      );
      case "INSTITUCIONAL": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo de Ação Interna *</label>
            <select className={styles.select}>
              <option>Reunião de Equipe</option>
              <option>Palestra Fechada</option>
              <option>Auditoria Bordo</option>
              <option>Assembleia Geral</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pauta Central</label>
            <textarea required className={styles.textarea} placeholder="Resuma os assuntos debatidos na ata..." />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Data e Hora</label>
            <input required type="datetime-local" className={styles.input} />
          </div>
        </>
      );
      case "PRODUTO": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Estoque/Armazenamento de Produto *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Bio-Joias" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quantidade Adicionada</label>
              <input type="number" className={styles.input} min="1" placeholder="Ex: 50" required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Valor Unitário (Opcional)</label>
              <input type="number" className={styles.input} min="0" step="0.01" placeholder="Ex: 25.50" />
            </div>
          </div>
        </>
      );
      case "RODA": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tema de Debate / Assunto *</label>
            <input required type="text" className={styles.input} placeholder="Ex: Prevenção Dengue na Comunidade" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Especialista/Mediador</label>
              <input type="text" className={styles.input} placeholder="Dr. Carlos" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ouvintes Presentes</label>
              <input type="number" className={styles.input} min="1" placeholder="Ex: 15" required />
            </div>
          </div>
        </>
      );
      case "ATENDIMENTO": return (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Classificação Primária *</label>
            <select className={styles.select}>
              <option>Psicologia</option>
              <option>Odontologia</option>
              <option>Orientação Social</option>
              <option>Medicina</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome do Beneficiário / Identificador</label>
            <input required type="text" className={styles.input} placeholder="Insira o nome..." />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data</label>
              <input required type="date" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Formato</label>
              <select className={styles.select}>
                <option>INDIVIDUAL</option>
                <option>FAMILIAR</option>
              </select>
            </div>
          </div>
        </>
      );
      default: return null;
    }
  };

  const selectedData = ACTIVITY_TYPES.find(t => t.id === selectedType);

  return (
    <>
      {/* Toast de Confirmação Mockado */}
      {showToast && (
        <div className={styles.mockToast}>
          <CheckCircle2 size={20} />
          Atividade simulada salva no Front-end!
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button 
        className={`${styles.fab} ${isOpen ? styles.fabClose : ""}`} 
        onClick={() => isOpen ? closeAll() : setIsOpen(true)}
        title="Nova Atividade Especial"
      >
        <Plus size={32} />
      </button>

      {/* MODAL 1: Catálogo de Tipos */}
      {isOpen && !selectedType && (
        <div className={styles.overlay} onClick={closeAll}>
          <div className={styles.catalogContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Cadastrar Nova Ação</h2>
                <p className={styles.subTitle}>Escolha qual modelo matemático da instituição você deseja alimentar hoje.</p>
              </div>
              <button className={styles.btnIcon} onClick={closeAll}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.gridBox}>
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.id} className={styles.typeCard} onClick={() => setSelectedType(type.id)}>
                    <div className={styles.typeIcon}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className={styles.typeName}>{type.name}</h3>
                      <p className={styles.typeDesc}>{type.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Formulário Dinâmico */}
      {isOpen && selectedType && selectedData && (
        <div className={styles.overlay} onClick={closeAll}>
          <div className={styles.formContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={styles.typeIcon} style={{ width: 44, height: 44, borderRadius: 12 }}>
                  <selectedData.icon size={22} />
                </div>
                <div>
                  <h2 className={styles.title}>Registro: {selectedData.name}</h2>
                  <p className={styles.subTitle}>O formulário mocado para o layout de {selectedData.name.toLowerCase()}</p>
                </div>
              </div>
              <button className={styles.btnIcon} onClick={closeAll}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFakeSubmit}>
              <div className={styles.formBody}>
                {renderFormContent()}
              </div>
              <div className={styles.formFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setSelectedType(null)}>
                  Voltar ao Catálogo
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Cadastrar {selectedData.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
