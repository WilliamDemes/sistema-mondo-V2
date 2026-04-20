import { NextResponse } from "next/server";
import { prisma } from "../../../infra/database";

export async function GET() {
  try {
    // Contagem geral de famílias
    const totalFamilias = await prisma.familia.count();

    // Contagem de familias ativas
    const familiasAtivas = await prisma.familia.count({
      where: { status: "ATIVA" },
    });

    // Contagem de beneficiários
    const moradoresAtivos = await prisma.beneficiarios.count();

    // Contagem de atendimentos e atividades
    const atendimentos = await prisma.acoes.count({
      where: { categoria: "ATENDIMENTO" },
    });

    // Contagem de atendimentos e atividades
    const atividades = await prisma.acoes.count({
      where: { categoria: "ATIVIDADE" },
    });

    // As cinco aatividades mais recentes
    const atividadesRecentes = await prisma.acoes.findMany({
      orderBy: { data: "desc" },
      take: 5, // 👉 O limite de 5 itens!
      include: {
         participacoes: true, // Incluímos isto para podermos contar quantas famílias participaram
      },
    });

    //Total de Participações
    const totalParticipacoes = await prisma.participacoes.count();

    //Participações por Mês
    const acoesComData = await prisma.acoes.findMany({
      select: {
        data: true,
        _count: { select: { participacoes: true } },
      },
    });

    const monthsMap: Record<string, number> = {};

    acoesComData.forEach((acao) => {
      // Extrai o mês abreviado em português e deixa em maiúsculo
      const month = new Date(acao.data)
        .toLocaleString("pt-BR", { month: "short" })
        .replace(".", "")
        .toUpperCase();

      if (!monthsMap[month]) monthsMap[month] = 0;
      monthsMap[month] += acao._count.participacoes;
    });

    const participacaoMensal = Object.keys(monthsMap).map((m) => ({
      month: m,
      count: monthsMap[m],
    }));

    //Famílias Mais Ativas
    const topFamilias = await prisma.familia.findMany({
      take: 5,
      orderBy: { participacoes: { _count: "desc" } },
      include: {
        _count: { select: { participacoes: true, beneficiarios: true } },
      },
    });

    const topFamilias2 = topFamilias.map((f) => ({
      id: f.idFamilia,
      nome: f.grupoReferencia || "Sem Nome",
      territory: f.cidade || "Não informado",
      status: f.status,
      count: f._count.participacoes,
      members: f._count.beneficiarios,
    }));

    //Territórios
    const todasFamilias = await prisma.familia.findMany({
      select: { cidade: true, status: true },
    });

    const territoriosMap: Record<
      string,
      { name: string; families: number; active: number }
    > = {};

    todasFamilias.forEach((f) => {
      const cidade = f.cidade || "Não informado";

      if (!territoriosMap[cidade]) {
        territoriosMap[cidade] = { name: cidade, families: 0, active: 0 };
      }

      territoriosMap[cidade].families++;
      if (f.status === "ATIVA") territoriosMap[cidade].active++;
    });

    // Transforma em array e ordena do maior para o menor
    const territorios = Object.values(territoriosMap).sort(
      (a, b) => b.families - a.families,
    );

    return NextResponse.json({
      familiasAtivas,
      moradoresAtivos,
      atendimentos,
      atividades,
      totalFamilias,
      atividadesRecentes,
      participacaoMensal,
      totalParticipacoes,
      topFamilias2,
      territorios,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar dado do dashboard" },
      { status: 500 },
    );
  }
}
