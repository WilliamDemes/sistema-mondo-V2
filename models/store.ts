// ═══════════════════════════════════════════════════════════
// Instituto Mondó — Store Centralizado (In-Memory)
// Todas as API Routes compartilham este store global.
// Quando integrar Prisma/PostgreSQL, basta substituir as
// funções abaixo por chamadas ao PrismaClient.
// ═══════════════════════════════════════════════════════════

export type FamilyStatus = "ATIVA" | "INATIVA";
export type BeneficiaryRole = "PAI" | "MAE" | "FILHO" | "FILHA" | "AVO" | "OUTRO";
export type ActivityType = "ATENDIMENTO" | "ATIVIDADE";
export type ActivityFormat = "INDIVIDUAL" | "GRUPO";

export interface Family {
  id: string;
  familyName: string;
  territory: string;
  address: string;
  status: FamilyStatus;
  observations: string | null;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  familyId: string;
  name: string;
  age: number;
  role: BeneficiaryRole;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  format: ActivityFormat;
  date: string;
  createdAt: string;
}

export interface Participation {
  id: string;
  familyId: string;
  activityId: string;
  participantCount: number;
  notes: string | null;
}

// ── Seed Data ──
const seedFamilies: Family[] = [
  { id: "f1", familyName: "Silva Santos", territory: "Comunidade São José", address: "Rua das Flores, 123 - Bairro Centro", status: "ATIVA", observations: "Família acompanhada desde 2024. Prioridade para atividades de fortalecimento de vínculos.", createdAt: "2024-03-15" },
  { id: "f2", familyName: "Oliveira Costa", territory: "Vila Esperança", address: "Av. Brasil, 456 - Jardim América", status: "ATIVA", observations: "Família com demanda de atendimento psicológico recorrente.", createdAt: "2024-06-20" },
  { id: "f3", familyName: "Souza Almeida", territory: "Comunidade São José", address: "Travessa da Paz, 78 - Centro", status: "INATIVA", observations: null, createdAt: "2023-11-10" },
  { id: "f4", familyName: "Ribeiro Martins", territory: "Vila Esperança", address: "Rua Primavera, 200 - Jardim Novo", status: "ATIVA", observations: "Família encaminhada pelo CRAS. Acompanhamento mensal.", createdAt: "2025-01-08" },
];

const seedBeneficiaries: Beneficiary[] = [
  { id: "b1", familyId: "f1", name: "Rafael Silva Santos", age: 31, role: "PAI" },
  { id: "b2", familyId: "f1", name: "Maria Oliveira Santos", age: 29, role: "MAE" },
  { id: "b3", familyId: "f1", name: "Pedro Silva Santos", age: 8, role: "FILHO" },
  { id: "b4", familyId: "f2", name: "Carlos Oliveira Costa", age: 42, role: "PAI" },
  { id: "b5", familyId: "f2", name: "Juliana Costa", age: 38, role: "MAE" },
  { id: "b6", familyId: "f2", name: "Lucas Oliveira Costa", age: 15, role: "FILHO" },
  { id: "b7", familyId: "f2", name: "Ana Clara Costa", age: 10, role: "FILHA" },
  { id: "b8", familyId: "f3", name: "Marcos Souza", age: 55, role: "PAI" },
  { id: "b9", familyId: "f3", name: "Teresa Almeida", age: 52, role: "MAE" },
  { id: "b10", familyId: "f4", name: "João Ribeiro", age: 35, role: "PAI" },
  { id: "b11", familyId: "f4", name: "Patrícia Martins", age: 33, role: "MAE" },
  { id: "b12", familyId: "f4", name: "Beatriz Ribeiro", age: 6, role: "FILHA" },
];

const seedActivities: Activity[] = [
  { id: "a1", title: "Atendimento Psicológico", description: "Registro de atendimento com encaminhamento para acompanhamento contínuo.", type: "ATENDIMENTO", format: "INDIVIDUAL", date: "2025-11-15", createdAt: "2025-11-15" },
  { id: "a2", title: "Roda de Conversa", description: "Participação em atividade comunitária com foco em fortalecimento de vínculos.", type: "ATIVIDADE", format: "GRUPO", date: "2025-10-02", createdAt: "2025-10-02" },
  { id: "a3", title: "Oficina de Artes", description: "Participação em oficina educativa com crianças e responsáveis.", type: "ATIVIDADE", format: "GRUPO", date: "2025-08-18", createdAt: "2025-08-18" },
  { id: "a4", title: "Visita Domiciliar", description: "Acompanhamento da situação familiar e atualização cadastral.", type: "ATENDIMENTO", format: "INDIVIDUAL", date: "2025-06-10", createdAt: "2025-06-10" },
  { id: "a5", title: "Grupo de Pais", description: "Atividade em grupo focada em parentalidade positiva.", type: "ATIVIDADE", format: "GRUPO", date: "2025-04-22", createdAt: "2025-04-22" },
];

const seedParticipations: Participation[] = [
  { id: "p1", familyId: "f1", activityId: "a1", participantCount: 1, notes: "Atendimento realizado com a mãe." },
  { id: "p2", familyId: "f1", activityId: "a2", participantCount: 3, notes: "Toda a família participou." },
  { id: "p3", familyId: "f1", activityId: "a3", participantCount: 2, notes: "Pedro e Maria participaram." },
  { id: "p4", familyId: "f1", activityId: "a4", participantCount: 1, notes: null },
  { id: "p5", familyId: "f1", activityId: "a5", participantCount: 2, notes: "Rafael e Maria participaram." },
  { id: "p6", familyId: "f2", activityId: "a2", participantCount: 4, notes: "Família completa presente." },
  { id: "p7", familyId: "f2", activityId: "a3", participantCount: 2, notes: null },
  { id: "p8", familyId: "f4", activityId: "a1", participantCount: 1, notes: "Primeiro atendimento." },
];

// ── Global Store ──
interface StoreData {
  families: Family[];
  beneficiaries: Beneficiary[];
  activities: Activity[];
  participations: Participation[];
}

const g = globalThis as unknown as { __mondoStore?: StoreData };

function getStore(): StoreData {
  if (!g.__mondoStore) {
    g.__mondoStore = {
      families: [...seedFamilies],
      beneficiaries: [...seedBeneficiaries],
      activities: [...seedActivities],
      participations: [...seedParticipations],
    };
  }
  return g.__mondoStore;
}

function genId(prefix: string): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ═══════════════════════════════════════════
// FAMÍLIAS
// ═══════════════════════════════════════════
export function getAllFamilies() {
  return getStore().families;
}

export function getFamilyById(id: string) {
  return getStore().families.find((f) => f.id === id) ?? null;
}

export function createFamily(data: Omit<Family, "id" | "createdAt">): Family {
  const f: Family = { ...data, id: genId("f"), createdAt: new Date().toISOString().split("T")[0] };
  getStore().families.push(f);
  return f;
}

export function updateFamily(id: string, data: Partial<Omit<Family, "id" | "createdAt">>): Family | null {
  const store = getStore();
  const idx = store.families.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  store.families[idx] = { ...store.families[idx], ...data };
  return store.families[idx];
}

export function deleteFamily(id: string): boolean {
  const store = getStore();
  const idx = store.families.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  store.families.splice(idx, 1);
  store.beneficiaries = store.beneficiaries.filter((b) => b.familyId !== id);
  store.participations = store.participations.filter((p) => p.familyId !== id);
  return true;
}

// ═══════════════════════════════════════════
// BENEFICIÁRIOS
// ═══════════════════════════════════════════
export function getBeneficiariesByFamily(familyId: string) {
  return getStore().beneficiaries.filter((b) => b.familyId === familyId);
}

export function createBeneficiary(data: Omit<Beneficiary, "id">): Beneficiary {
  const b: Beneficiary = { ...data, id: genId("b") };
  getStore().beneficiaries.push(b);
  return b;
}

export function deleteBeneficiary(id: string): boolean {
  const store = getStore();
  const idx = store.beneficiaries.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  store.beneficiaries.splice(idx, 1);
  return true;
}

export function getAllBeneficiaries() {
  return getStore().beneficiaries;
}

// ═══════════════════════════════════════════
// ATIVIDADES
// ═══════════════════════════════════════════
export function getAllActivities() {
  return getStore().activities;
}

export function getActivityById(id: string) {
  return getStore().activities.find((a) => a.id === id) ?? null;
}

export function createActivity(data: Omit<Activity, "id" | "createdAt">): Activity {
  const a: Activity = { ...data, id: genId("a"), createdAt: new Date().toISOString() };
  getStore().activities.push(a);
  return a;
}

export function updateActivity(id: string, data: Partial<Omit<Activity, "id" | "createdAt">>): Activity | null {
  const store = getStore();
  const idx = store.activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.activities[idx] = { ...store.activities[idx], ...data };
  return store.activities[idx];
}

export function deleteActivity(id: string): boolean {
  const store = getStore();
  const idx = store.activities.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.activities.splice(idx, 1);
  store.participations = store.participations.filter((p) => p.activityId !== id);
  return true;
}

// ═══════════════════════════════════════════
// PARTICIPAÇÕES
// ═══════════════════════════════════════════
export function getParticipationsByFamily(familyId: string) {
  const store = getStore();
  return store.participations
    .filter((p) => p.familyId === familyId)
    .map((p) => ({
      ...p,
      activity: store.activities.find((a) => a.id === p.activityId)!,
    }))
    .filter((p) => p.activity)
    .sort((a, b) => new Date(b.activity.date).getTime() - new Date(a.activity.date).getTime());
}

export function getParticipationsByActivity(activityId: string) {
  return getStore().participations.filter((p) => p.activityId === activityId);
}

export function getAllParticipations() {
  return getStore().participations;
}

export function createParticipation(data: Omit<Participation, "id">): Participation {
  const p: Participation = { ...data, id: genId("p") };
  getStore().participations.push(p);
  return p;
}

export function deleteParticipation(id: string): boolean {
  const store = getStore();
  const idx = store.participations.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.participations.splice(idx, 1);
  return true;
}

// ═══════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════
export function getDashboardStats() {
  const store = getStore();
  const activeFamilies = store.families.filter((f) => f.status === "ATIVA").length;
  const totalFamilies = store.families.length;
  const totalBeneficiaries = store.beneficiaries.length;
  const activeBeneficiaries = store.beneficiaries.filter((b) =>
    store.families.find((f) => f.id === b.familyId)?.status === "ATIVA"
  ).length;
  const totalAtendimentos = store.activities.filter((a) => a.type === "ATENDIMENTO").length;
  const totalAtividades = store.activities.filter((a) => a.type === "ATIVIDADE").length;
  const totalParticipations = store.participations.length;

  // Participações por mês (últimos 6 meses)
  const monthlyParticipations: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const count = store.participations.filter((p) => {
      const act = store.activities.find((a) => a.id === p.activityId);
      if (!act) return false;
      return act.date.startsWith(key);
    }).length;
    monthlyParticipations.push({ month: label, count });
  }

  // Top 5 famílias mais ativas
  const familyParticipationCounts = store.families.map((f) => ({
    id: f.id,
    name: f.familyName,
    territory: f.territory,
    status: f.status,
    count: store.participations.filter((p) => p.familyId === f.id).length,
    members: store.beneficiaries.filter((b) => b.familyId === f.id).length,
  }));
  const topFamilies = familyParticipationCounts.sort((a, b) => b.count - a.count).slice(0, 5);

  // Atividades recentes
  const recentActivities = [...store.activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((a) => ({
      ...a,
      participationCount: store.participations.filter((p) => p.activityId === a.id).length,
    }));

  // Territórios
  const territories = [...new Set(store.families.map((f) => f.territory))].map((t) => ({
    name: t,
    families: store.families.filter((f) => f.territory === t).length,
    active: store.families.filter((f) => f.territory === t && f.status === "ATIVA").length,
  }));

  return {
    activeFamilies,
    totalFamilies,
    totalBeneficiaries,
    activeBeneficiaries,
    totalAtendimentos,
    totalAtividades,
    totalParticipations,
    monthlyParticipations,
    topFamilies,
    recentActivities,
    territories,
  };
}

// ═══════════════════════════════════════════
// DADOS AUXILIARES (Migrados de antigo mock-data)
// ═══════════════════════════════════════════
export const currentUser = {
  id: "user1",
  name: "Ana Silva",
  email: "ana@institutomondo.org.br",
  role: "ADMIN",
};

export const families = getStore().families;
