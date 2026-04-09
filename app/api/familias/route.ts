import { NextResponse } from "next/server";
import { prisma } from "@/infra/database";

// FUNÇÃO PARA BUSCAR AS FAMÍLIAS (GET)
export async function GET() {
  try {
    const familias = await prisma.familia.findMany({
      orderBy: { createdAt: "desc" },
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
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar famílias" },
      { status: 500 },
    );
  }
}

// FUNÇÃO PARA CRIAR NOVA FAMÍLIA (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // O Prisma converte os dados e salva na tabela "familias"
    const novaFamilia = await prisma.familia.create({
      data: {
        idMondoFamilia: body.idMondoFamilia,
        cidade: body.cidade,
        estado: body.estado,
        grupoReferencia: body.grupoReferencia,
        observacao: body.observacao,
        status: "ATIVA", // Por padrão
      },
    });

    return NextResponse.json(novaFamilia, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar família no banco" },
      { status: 500 },
    );
  }
}
