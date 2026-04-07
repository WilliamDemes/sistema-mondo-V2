import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/infra/database";

export async function GET(request: NextRequest) {
  try {
    // 0. Pegando o termo digitado no campo de pesquisa. "busca" é o nome da etiqueta que vai pendurado na url na pesquisa
    const termoBusca = request.nextUrl.searchParams.get("busca") || "";

    // 1. Busca todas as atividades do banco de dados REAL, da mais nova pra mais velha
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          {nomeAcao: {contains: termoBusca, mode: "insensitive"}},
          {descricao: {contains: termoBusca, mode: "insensitive"}}
        ],
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Erro no GET:", error);
    return NextResponse.json(
      { error: "Erro ao buscar atividades" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 2. Abrindo a "caixa" (payload) com os nomes exatos que o seu Front-end mandou
    const {
      nomeAcao,
      descricao,
      dimensao,
      projeto,
      tipo,
      formato,
      local,
      semestre,
      date,
    } = body;

    // 3. Validação de segurança
    if (
      !nomeAcao ||
      !tipo ||
      !formato ||
      !date ||
      !dimensao ||
      !projeto ||
      !local
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    // 4. Salvando de verdade no PostgreSQL via Prisma
    const activity = await prisma.activity.create({
      data: {
        nomeAcao: nomeAcao.trim(),
        descricao: descricao?.trim() || null,
        dimensao,
        projeto,
        tipo,
        formato,
        local,
        // O Prisma exige que Datas sejam transformadas em Objetos do tipo Date
        date: new Date(date + "T12:00:00Z"),
        // Veja a explicação sobre o semestre logo abaixo!
        semestre: semestre,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json(
      { error: "Erro ao criar atividade" },
      { status: 500 },
    );
  }
}
