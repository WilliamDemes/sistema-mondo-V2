import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/bancoDeDados";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const atividade = await prisma.acoes.findUnique({
      where: { idAcao: id }
    });
    if (!atividade)
      return NextResponse.json(
        { erro: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json(atividade);
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ erro: "Erro" }, { status: 500 });
  }
}

export async function PUT(requisicao: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const corpo = await requisicao.json();
    const { nomeAcao, descricao, dimensao, projeto, rubrica, categoria, formato, local, semestre, data } = corpo;
    const updated = await prisma.acoes.update({
      where: { idAcao: id },
      data: {
        nomeAcao,
        descricao,
        dimensao,
        rubrica,
        projeto,
        categoria,
        formato,
        local,
        semestre,
        data: new Date(data + "T12:00:00Z")
      },
    });
    if (!updated)
      return NextResponse.json(
        { erro: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json(updated);
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ erro: "Erro" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ok = await prisma.acoes.delete({
      where: { idAcao: id },
    });
    if (!ok)
      return NextResponse.json(
        { erro: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json({ message: "Atividade excluída" });
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ erro: "Erro" }, { status: 500 });
  }
}
