import { NextResponse } from "next/server";
import { prisma } from "@/infra/bancoDeDados";

// FUNÇÃO PARA BUSCAR AS FAMÍLIAS (GET)
export async function GET() {
  try {
    const familias = await prisma.familia.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        _count: {
          select: { beneficiarios: true, participacoes: true },
        },
        // Trazendo os beneficiarios junto com as familias
        beneficiarios: {
          select: {
            nome: true,
            responsavel: true,
          },
        },
      },
    });
    return NextResponse.json(familias);
  } catch (erro) {
    return NextResponse.json(
      { erro: "Erro ao buscar famílias" },
      { status: 500 },
    );
  }
}

// FUNÇÃO PARA CRIAR NOVA FAMÍLIA (POST)
export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();

    // O Prisma converte os dados e salva na tabela "familias"
    const novaFamilia = await prisma.familia.create({
      data: {
        idFamilia: corpo.idMondoFamilia, // Keeping corpo mapping since frontend might send the old name, but mapped to new DB column
        cidade: corpo.cidade,
        estado: corpo.estado,
        grupoReferencia: corpo.grupoReferencia,
        observacao: corpo.observacao,
        status: "ATIVA", // Por padrão
      },
    });

    return NextResponse.json(novaFamilia, { status: 201 });
  } catch (erro) {
    return NextResponse.json(
      { erro: "Erro ao salvar família no banco" },
      { status: 500 },
    );
  }
}

