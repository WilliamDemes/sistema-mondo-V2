// ═══════════════════════════════════════════════════════════
// Instituto Mondó — Store Centralizado (In-Memory)
// Todas as API Routes compartilham este store global.
// Quando integrar Prisma/PostgreSQL, basta substituir as
// funções abaixo por chamadas ao PrismaClient.
// ═══════════════════════════════════════════════════════════

export type StatusFamilia = "ATIVA" | "INATIVA";
export type PapelBeneficiario = "PAI" | "MAE" | "FILHO" | "FILHA" | "AVO" | "OUTRO";
export type TipoAtividade = "ATENDIMENTO" | "ATIVIDADE";
export type FormatoAtividade = "INDIVIDUAL" | "GRUPO";

export interface Familia {
  id: string;
  nomeFamilia: string;
  territorio: string;
  endereco: string;
  status: StatusFamilia;
  observacoes: string | null;
  criadoEm: string;
}

export interface Beneficiario {
  id: string;
  familiaId: string;
  nome: string;
  idade: number;
  papel: PapelBeneficiario;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoAtividade;
  formato: FormatoAtividade;
  data: string;
  criadoEm: string;
}

export interface Participacao {
  id: string;
  familiaId: string;
  atividadeId: string;
  quantidadeParticipantes: number;
  anotacoes: string | null;
}

// ── Seed Data ──
const sementesFamilias: Familia[] = [
  { id: "f1", nomeFamilia: "Silva Santos", territorio: "Comunidade São José", endereco: "Rua das Flores, 123 - Bairro Centro", status: "ATIVA", observacoes: "Família acompanhada desde 2024. Prioridade para atividades de fortalecimento de vínculos.", criadoEm: "2024-03-15" },
  { id: "f2", nomeFamilia: "Oliveira Costa", territorio: "Vila Esperança", endereco: "Av. Brasil, 456 - Jardim América", status: "ATIVA", observacoes: "Família com demanda de atendimento psicológico recorrente.", criadoEm: "2024-06-20" },
  { id: "f3", nomeFamilia: "Souza Almeida", territorio: "Comunidade São José", endereco: "Travessa da Paz, 78 - Centro", status: "INATIVA", observacoes: null, criadoEm: "2023-11-10" },
  { id: "f4", nomeFamilia: "Ribeiro Martins", territorio: "Vila Esperança", endereco: "Rua Primavera, 200 - Jardim Novo", status: "ATIVA", observacoes: "Família encaminhada pelo CRAS. Acompanhamento mensal.", criadoEm: "2025-01-08" },
];

const sementesBeneficiarios: Beneficiario[] = [
  { id: "b1", familiaId: "f1", nome: "Rafael Silva Santos", idade: 31, papel: "PAI" },
  { id: "b2", familiaId: "f1", nome: "Maria Oliveira Santos", idade: 29, papel: "MAE" },
  { id: "b3", familiaId: "f1", nome: "Pedro Silva Santos", idade: 8, papel: "FILHO" },
  { id: "b4", familiaId: "f2", nome: "Carlos Oliveira Costa", idade: 42, papel: "PAI" },
  { id: "b5", familiaId: "f2", nome: "Juliana Costa", idade: 38, papel: "MAE" },
  { id: "b6", familiaId: "f2", nome: "Lucas Oliveira Costa", idade: 15, papel: "FILHO" },
  { id: "b7", familiaId: "f2", nome: "Ana Clara Costa", idade: 10, papel: "FILHA" },
  { id: "b8", familiaId: "f3", nome: "Marcos Souza", idade: 55, papel: "PAI" },
  { id: "b9", familiaId: "f3", nome: "Teresa Almeida", idade: 52, papel: "MAE" },
  { id: "b10", familiaId: "f4", nome: "João Ribeiro", idade: 35, papel: "PAI" },
  { id: "b11", familiaId: "f4", nome: "Patrícia Martins", idade: 33, papel: "MAE" },
  { id: "b12", familiaId: "f4", nome: "Beatriz Ribeiro", idade: 6, papel: "FILHA" },
];

const sementesAtividades: Atividade[] = [
  { id: "a1", titulo: "Atendimento Psicológico", descricao: "Registro de atendimento com encaminhamento para acompanhamento contínuo.", tipo: "ATENDIMENTO", formato: "INDIVIDUAL", data: "2025-11-15", criadoEm: "2025-11-15" },
  { id: "a2", titulo: "Roda de Conversa", descricao: "Participação em atividade comunitária com foco em fortalecimento de vínculos.", tipo: "ATIVIDADE", formato: "GRUPO", data: "2025-10-02", criadoEm: "2025-10-02" },
  { id: "a3", titulo: "Oficina de Artes", descricao: "Participação em oficina educativa com crianças e responsáveis.", tipo: "ATIVIDADE", formato: "GRUPO", data: "2025-08-18", criadoEm: "2025-08-18" },
  { id: "a4", titulo: "Visita Domiciliar", descricao: "Acompanhamento da situação familiar e atualização cadastral.", tipo: "ATENDIMENTO", formato: "INDIVIDUAL", data: "2025-06-10", criadoEm: "2025-06-10" },
  { id: "a5", titulo: "Grupo de Pais", descricao: "Atividade em grupo focada em parentalidade positiva.", tipo: "ATIVIDADE", formato: "GRUPO", data: "2025-04-22", criadoEm: "2025-04-22" },
];

const sementesParticipacoes: Participacao[] = [
  { id: "p1", familiaId: "f1", atividadeId: "a1", quantidadeParticipantes: 1, anotacoes: "Atendimento realizado com a mãe." },
  { id: "p2", familiaId: "f1", atividadeId: "a2", quantidadeParticipantes: 3, anotacoes: "Toda a família participou." },
  { id: "p3", familiaId: "f1", atividadeId: "a3", quantidadeParticipantes: 2, anotacoes: "Pedro e Maria participaram." },
  { id: "p4", familiaId: "f1", atividadeId: "a4", quantidadeParticipantes: 1, anotacoes: null },
  { id: "p5", familiaId: "f1", atividadeId: "a5", quantidadeParticipantes: 2, anotacoes: "Rafael e Maria participaram." },
  { id: "p6", familiaId: "f2", atividadeId: "a2", quantidadeParticipantes: 4, anotacoes: "Família completa presente." },
  { id: "p7", familiaId: "f2", atividadeId: "a3", quantidadeParticipantes: 2, anotacoes: null },
  { id: "p8", familiaId: "f4", atividadeId: "a1", quantidadeParticipantes: 1, anotacoes: "Primeiro atendimento." },
];

// ── Global Store ──
interface DadosDoEstado {
  familias: Familia[];
  beneficiarios: Beneficiario[];
  atividades: Atividade[];
  participacoes: Participacao[];
}

const g = globalThis as unknown as { __estadoMondo?: DadosDoEstado };

function obterEstado(): DadosDoEstado {
  if (!g.__estadoMondo) {
    g.__estadoMondo = {
      familias: [...sementesFamilias],
      beneficiarios: [...sementesBeneficiarios],
      atividades: [...sementesAtividades],
      participacoes: [...sementesParticipacoes],
    };
  }
  return g.__estadoMondo;
}

function gerarId(prefixo: string): string {
  return `${prefixo}${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ═══════════════════════════════════════════
// FAMÍLIAS
// ═══════════════════════════════════════════
export function buscarTodasFamilias() {
  return obterEstado().familias;
}

export function buscarFamiliaPorId(id: string) {
  return obterEstado().familias.find((f) => f.id === id) ?? null;
}

export function criarFamilia(dados: Omit<Familia, "id" | "criadoEm">): Familia {
  const f: Familia = { ...dados, id: gerarId("f"), criadoEm: new Date().toISOString().split("T")[0] };
  obterEstado().familias.push(f);
  return f;
}

export function atualizarFamilia(id: string, dados: Partial<Omit<Familia, "id" | "criadoEm">>): Familia | null {
  const estado = obterEstado();
  const indice = estado.familias.findIndex((f) => f.id === id);
  if (indice === -1) return null;
  estado.familias[indice] = { ...estado.familias[indice], ...dados };
  return estado.familias[indice];
}

export function deletarFamilia(id: string): boolean {
  const estado = obterEstado();
  const indice = estado.familias.findIndex((f) => f.id === id);
  if (indice === -1) return false;
  estado.familias.splice(indice, 1);
  estado.beneficiarios = estado.beneficiarios.filter((b) => b.familiaId !== id);
  estado.participacoes = estado.participacoes.filter((p) => p.familiaId !== id);
  return true;
}

// ═══════════════════════════════════════════
// BENEFICIÁRIOS
// ═══════════════════════════════════════════
export function buscarBeneficiariosPorFamilia(familiaId: string) {
  return obterEstado().beneficiarios.filter((b) => b.familiaId === familiaId);
}

export function criarBeneficiario(dados: Omit<Beneficiario, "id">): Beneficiario {
  const b: Beneficiario = { ...dados, id: gerarId("b") };
  obterEstado().beneficiarios.push(b);
  return b;
}

export function deletarBeneficiario(id: string): boolean {
  const estado = obterEstado();
  const indice = estado.beneficiarios.findIndex((b) => b.id === id);
  if (indice === -1) return false;
  estado.beneficiarios.splice(indice, 1);
  return true;
}

export function buscarTodosBeneficiarios() {
  return obterEstado().beneficiarios;
}

// ═══════════════════════════════════════════
// ATIVIDADES
// ═══════════════════════════════════════════
export function buscarTodasAtividades() {
  return obterEstado().atividades;
}

export function buscarAtividadePorId(id: string) {
  return obterEstado().atividades.find((a) => a.id === id) ?? null;
}

export function criarAtividade(dados: Omit<Atividade, "id" | "criadoEm">): Atividade {
  const a: Atividade = { ...dados, id: gerarId("a"), criadoEm: new Date().toISOString() };
  obterEstado().atividades.push(a);
  return a;
}

export function atualizarAtividade(id: string, dados: Partial<Omit<Atividade, "id" | "criadoEm">>): Atividade | null {
  const estado = obterEstado();
  const indice = estado.atividades.findIndex((a) => a.id === id);
  if (indice === -1) return null;
  estado.atividades[indice] = { ...estado.atividades[indice], ...dados };
  return estado.atividades[indice];
}

export function deletarAtividade(id: string): boolean {
  const estado = obterEstado();
  const indice = estado.atividades.findIndex((a) => a.id === id);
  if (indice === -1) return false;
  estado.atividades.splice(indice, 1);
  estado.participacoes = estado.participacoes.filter((p) => p.atividadeId !== id);
  return true;
}

// ═══════════════════════════════════════════
// PARTICIPAÇÕES
// ═══════════════════════════════════════════
export function buscarParticipacoesPorFamilia(familiaId: string) {
  const estado = obterEstado();
  return estado.participacoes
    .filter((p) => p.familiaId === familiaId)
    .map((p) => ({
      ...p,
      atividade: estado.atividades.find((a) => a.id === p.atividadeId)!,
    }))
    .filter((p) => p.atividade)
    .sort((a, b) => new Date(b.atividade.data).getTime() - new Date(a.atividade.data).getTime());
}

export function buscarParticipacoesPorAtividade(atividadeId: string) {
  return obterEstado().participacoes.filter((p) => p.atividadeId === atividadeId);
}

export function buscarTodasParticipacoes() {
  return obterEstado().participacoes;
}

export function criarParticipacao(dados: Omit<Participacao, "id">): Participacao {
  const p: Participacao = { ...dados, id: gerarId("p") };
  obterEstado().participacoes.push(p);
  return p;
}

export function deletarParticipacao(id: string): boolean {
  const estado = obterEstado();
  const indice = estado.participacoes.findIndex((p) => p.id === id);
  if (indice === -1) return false;
  estado.participacoes.splice(indice, 1);
  return true;
}

// ═══════════════════════════════════════════
// ESTATÍSTICAS DO DASHBOARD
// ═══════════════════════════════════════════
export function buscarEstatisticasDashboard() {
  const estado = obterEstado();
  const familiasAtivas = estado.familias.filter((f) => f.status === "ATIVA").length;
  const totalFamilias = estado.familias.length;
  const totalBeneficiarios = estado.beneficiarios.length;
  const beneficiariosAtivos = estado.beneficiarios.filter((b) =>
    estado.familias.find((f) => f.id === b.familiaId)?.status === "ATIVA"
  ).length;
  const totalAtendimentos = estado.atividades.filter((a) => a.tipo === "ATENDIMENTO").length;
  const totalAtividades = estado.atividades.filter((a) => a.tipo === "ATIVIDADE").length;
  const totalParticipacoes = estado.participacoes.length;

  // Participações por mês (últimos 6 meses)
  const participacoesMensais: { mes: string; quantidade: number }[] = [];
  const agora = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rotulo = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const quantidade = estado.participacoes.filter((p) => {
      const ativ = estado.atividades.find((a) => a.id === p.atividadeId);
      if (!ativ) return false;
      return ativ.data.startsWith(chave);
    }).length;
    participacoesMensais.push({ mes: rotulo, quantidade });
  }

  // Top 5 famílias mais ativas
  const contagemParticipacoesFamilias = estado.familias.map((f) => ({
    id: f.id,
    nome: f.nomeFamilia,
    territorio: f.territorio,
    status: f.status,
    quantidade: estado.participacoes.filter((p) => p.familiaId === f.id).length,
    membros: estado.beneficiarios.filter((b) => b.familiaId === f.id).length,
  }));
  const topFamilias = contagemParticipacoesFamilias.sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);

  // Atividades recentes
  const atividadesRecentes = [...estado.atividades]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5)
    .map((a) => ({
      ...a,
      quantidadeParticipacoes: estado.participacoes.filter((p) => p.atividadeId === a.id).length,
    }));

  // Territórios
  const territorios = [...new Set(estado.familias.map((f) => f.territorio))].map((t) => ({
    nome: t,
    familias: estado.familias.filter((f) => f.territorio === t).length,
    ativas: estado.familias.filter((f) => f.territorio === t && f.status === "ATIVA").length,
  }));

  return {
    familiasAtivas,
    totalFamilias,
    totalBeneficiaries: totalBeneficiarios,
    activeBeneficiaries: beneficiariosAtivos,
    totalAtendimentos,
    totalAtividades,
    totalParticipacoes,
    participacoesMensais,
    topFamilias,
    atividadesRecentes,
    territorios,
  };
}

// ═══════════════════════════════════════════
// DADOS AUXILIARES (Migrados de antigo mock-data)
// ═══════════════════════════════════════════
export const usuarioAtual = {
  id: "user1",
  nome: "Ana Silva",
  email: "ana@institutomondo.org.br",
  papel: "ADMIN",
};

export const familiasConst = obterEstado().familias;
