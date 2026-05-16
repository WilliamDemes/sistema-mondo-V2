export type DashboardItem = {
  id: string;
  category: string;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  description: string;
};

const CATEGORIES = [
  "Famílias Ativas",
  "Moradores Ativos",
  "Atendimentos",
  "Atividades",
  "Premiação",
  "Doação",
  "Visitas Externas",
  "Consultoria",
  "Cursos",
  "Atividades Institucionais",
  "Produtos Entregues",
  "Rodas de Conversa"
];

const MOCK_TITLES: Record<string, string[]> = {
  "Famílias Ativas": ["Cadastro Aprovado", "Atualização Cadastral", "Revisão de Benefício"],
  "Moradores Ativos": ["Ingresso de novo membro", "Adesão às regras", "Atualização de Morador"],
  "Atendimentos": ["Atendimento Psicológico", "Acolhimento Social", "Atendimento Médico"],
  "Atividades": ["Oficina de Costura", "Aula de Dança", "Treinamento Técnico"],
  "Premiação": ["Destaque Comunitário", "Prêmio Sustentabilidade", "Menção Honrosa"],
  "Doação": ["Cestas Básicas", "Roupas de Inverno", "Kits de Higiene"],
  "Visitas Externas": ["Visita Domiciliar", "Visita Institucional", "Acompanhamento Técnico"],
  "Consultoria": ["Consultoria Financeira", "Consultoria Jurídica", "Consultoria Agrícola"],
  "Cursos": ["Curso de Informática", "Curso de Corte e Costura", "Alfabetização de Adultos"],
  "Atividades Institucionais": ["Reunião de Diretoria", "Assembleia Geral", "Encontro de Parceiros"],
  "Produtos Entregues": ["Agasalhos", "Materiais Escolares", "Brinquedos de Natal"],
  "Rodas de Conversa": ["Saúde Mental", "Empoderamento Feminino", "Educação Financeira"]
};

// Generate random mock data
export function generateFakeData(): DashboardItem[] {
  const data: DashboardItem[] = [];
  const years = [2023, 2024, 2025, 2026];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  let idCounter = 1;

  CATEGORIES.forEach((category) => {
    // Generate ~40 items per category spread across dates
    for (let i = 0; i < 40; i++) {
      const year = years[Math.floor(Math.random() * years.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const day = Math.floor(Math.random() * 28) + 1; // 1 to 28
      
      const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      
      const titles = MOCK_TITLES[category] || ["Registro Geral"];
      const title = titles[Math.floor(Math.random() * titles.length)];

      data.push({
        id: `mock-${idCounter++}`,
        category,
        title: `${title} - Lote ${Math.floor(Math.random() * 100)}`,
        date: dateStr,
        description: `Detalhes referente a ${category.toLowerCase()} na data ${dateStr}.`
      });
    }
  });

  // Sort descending by date
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const ALL_FAKE_DATA = generateFakeData();
