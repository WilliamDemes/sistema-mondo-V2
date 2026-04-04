import { NextResponse } from "next/server";
import { getDashboardStats } from "@/models/store";
import { prisma } from "../../../infra/database";

export async function GET() {
  try {
    // Contagem de familias ativas
    const familiasAtivas = await prisma.family.count({
      where: { status: "ATIVA" },
    });

    // Contagem de beneficiários
    const moradoresAtivos = await prisma.beneficiary.count();

    // Contagem de atendimentos e atividades
    const atendimentos = await prisma.activity.count({
      where: { type: "ATENDIMENTO" },
    });

    const atividades = await prisma.activity.count({
      where: { type: "ATIVIDADE" },
    });

    return NextResponse.json({
      familiasAtivas,
      moradoresAtivos,
      atendimentos,
      atividades,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar dado do dashboard" },
      { status: 500 },
    );
  }
}
