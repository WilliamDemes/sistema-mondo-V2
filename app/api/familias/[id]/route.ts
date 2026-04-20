import { NextResponse } from "next/server";
import { prisma } from "@/infra/database";

// 1. BUSCAR A FAMÍLIA (GET)
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    // 👇 ADICIONADO: "Abrindo a caixa" dos parâmetros com await
    const params = await props.params;
    const familiaId = params.id;

    const familia = await prisma.familia.findUnique({
      where: {
        id_sistema: familiaId, // Usando o ID que acabamos de abrir
      },
      include: {
        beneficiarios: {
          orderBy: { responsavel: "asc" }, // Traz o responsável primeiro
        },
        participacoes: {
          include: { acoes: true },
          orderBy: { criadoEm: "desc" },
        },
      },
    });

    if (!familia) {
      return NextResponse.json(
        { error: "Família não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(familia);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar família" },
      { status: 500 },
    );
  }
}

// 2. EDITAR A FAMÍLIA (PUT)
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();

    // 👇 ADICIONADO: Abrindo a caixa no PUT também
    const params = await props.params;
    const familiaId = params.id;

    const familiaAtualizada = await prisma.familia.update({
      where: { id_sistema: familiaId },
      data: {
        idFamilia: body.idFamilia,
        cidade: body.cidade,
        estado: body.estado,
        grupoReferencia: body.grupoReferencia,
        status: body.status,
        observacao: body.observacao,
      },
    });

    return NextResponse.json(familiaAtualizada);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar família" },
      { status: 500 },
    );
  }
}
