import { NextResponse } from "next/server";
import { prisma } from "@/infra/bancoDeDados";

// 1. BUSCAR A FAMÍLIA (GET)
export async function GET(
  requisicao: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    // 👇 ADICIONADO: "Abrindo a caixa" dos parâmetros com await
    const params = await props.params;
    const familiaId = params.id;

    const familia = await prisma.familia.findUnique({
      where: {
        idFamilia: familiaId, // Usando o ID que acabamos de abrir
      },
      include: {
        beneficiarios: {
          orderBy: { responsavel: "asc" }, // Traz o responsável primeiro
        },
        participacoes: {
          include: { acoes: true },
          orderBy: { criadoEm: "desc" },
        },
        enderecos: {
          orderBy: { idFamilia: "desc" }, // Traz o endereço mais recente primeiro
          take: 1, // Pega apenas o último endereço registrado
        }
      },
    });

    if (!familia) {
      return NextResponse.json(
        { erro: "Família não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(familia);
  } catch (erro) {
    return NextResponse.json(
      { erro: "Erro ao buscar família" },
      { status: 500 },
    );
  }
}

// 2. EDITAR A FAMÍLIA (PUT)
export async function PUT(
  requisicao: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const corpo = await requisicao.json();

    // 👇 ADICIONADO: Abrindo a caixa no PUT também
    const params = await props.params;
    const familiaId = params.id;

    const familiaAtualizada = await prisma.familia.update({
      where: { idFamilia: familiaId },
      data: {
        idFamilia: corpo.idFamilia,
        cidade: corpo.cidade,
        estado: corpo.estado,
        grupoReferencia: corpo.grupoReferencia,
        status: corpo.status,
        observacao: corpo.observacao,
      },
    });

    return NextResponse.json(familiaAtualizada);
  } catch (erro) {
    return NextResponse.json(
      { erro: "Erro ao atualizar família" },
      { status: 500 },
    );
  }
}
