import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/infra/database";

export async function GET(request: NextRequest) {
  try {
    // 0. Pegando o termo digitado no campo de pesquisa. "busca" é o nome da etiqueta que vai pendurado na url na pesquisa
    // 0. Pegando o termo de busca
    const termoBusca = request.nextUrl.searchParams.get("busca") || "";

    // 1. Descobrindo em qual página estamos
    const paginaTexto = request.nextUrl.searchParams.get("pagina") || "1";
    const paginaAtual = parseInt(paginaTexto);

    // 2. Descobrindo o Limite (Quantos itens por página?)
    // Se a URL não tiver a palavra "limite", ele usa o "10" como padrão.
    const limiteTexto = request.nextUrl.searchParams.get("limite") || "10";
    const itensPorPagina = parseInt(limiteTexto);

    // 3. AGORA calculamos o pulo (skip), porque já sabemos exatamente o tamanho da página!
    const skip = (paginaAtual - 1) * itensPorPagina;
    


    // 1. DADOS DA TELA: Busca apenas os 10 itens da página atual, filtrados pela busca
    const atividadesDaPagina = await prisma.activity.findMany({
      where: {
        OR: [
          { nomeAcao: { contains: termoBusca, mode: "insensitive" } },
          { descricao: { contains: termoBusca, mode: "insensitive" } }
        ],
      },
      orderBy: { date: "desc" }, // Da mais nova para a mais velha
      skip,                      // Pula os itens das páginas anteriores
      take: itensPorPagina       // Pega apenas o limite da página (ex: 10)
    });

    // 2. MATEMÁTICA DA PAGINAÇÃO: Conta todos os cadastros que batem com a busca (para saber o total de páginas)
    const totalGeralEncontrado = await prisma.activity.count({
      where: {
        OR: [
          { nomeAcao: { contains: termoBusca, mode: "insensitive" } },
          { descricao: { contains: termoBusca, mode: "insensitive" } }
        ],
      }
    });

    // 3. ESTATÍSTICAS: Conta apenas os itens com tipo "ATIVIDADE" para as caixinhas coloridas do Front-end
    const contagemAtividades = await prisma.activity.count({
      where: {
        tipo: "ATIVIDADE",
        OR: [
          { nomeAcao: { contains: termoBusca, mode: "insensitive" } },
          { descricao: { contains: termoBusca, mode: "insensitive" } }
        ]
      }
    });

    // 4. ESTATÍSTICAS: Conta apenas os itens com tipo "ATENDIMENTO" para as caixinhas coloridas do Front-end
    const contagemAtendimentos = await prisma.activity.count({
      where: {
        tipo: "ATENDIMENTO",
        OR: [
          { nomeAcao: { contains: termoBusca, mode: "insensitive" } },
          { descricao: { contains: termoBusca, mode: "insensitive" } }
        ]
      }
    });

    return NextResponse.json({
      atividadesDaPagina,
      totalGeralEncontrado,  // O número total (ex: 15)
      paginaAtual,  // A página que ele está vendo
      contagemAtividades,
      contagemAtendimentos,
      totalPaginas: Math.ceil(totalGeralEncontrado / itensPorPagina) // Cálculo automático de quantas páginas existem
    });
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
