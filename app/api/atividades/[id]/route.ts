import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const atividade = await prisma.activity.findUnique({
      where: {id}
    });
    if (!atividade)
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json(atividade);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nomeAcao, descricao, dimensao, projeto, tipo, formato, local, semestre, date } = body;
    const updated = await prisma.activity.update({
      where: { id },
      data: {
        nomeAcao,
        descricao,
        dimensao,
        projeto,
        tipo,
        formato,
        local,
        semestre,
        date: new Date(date + "T12:00:00Z")
      },
    });
    if (!updated)
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ok = await prisma.activity.delete({
      where: { id },
    });
    if (!ok)
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 },
      );
    return NextResponse.json({ message: "Atividade excluída" });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
