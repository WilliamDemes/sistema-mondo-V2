import { NextResponse } from "next/server";
import { prisma } from "@/infra/database";

export async function GET(
  requisicao: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const idFamilia = Number(id);

    if (isNaN(idFamilia)) {
      return NextResponse.json(
        { erro: "ID da família inválido" },
        { status: 400 }
      );
    }

    const dadosIndicadores = await prisma.indicadoresTranspostos.findMany({
      where: { domiCod: idFamilia },
      orderBy: { domiRodada: "asc" },
    });

    return NextResponse.json(dadosIndicadores);
  } catch (erro: any) {
    console.error("Erro ao buscar indicadores da família:", erro?.message);
    return NextResponse.json(
      { erro: "Ocorreu um erro ao buscar os indicadores", detalhe: erro?.message },
      { status: 500 }
    );
  }
}
