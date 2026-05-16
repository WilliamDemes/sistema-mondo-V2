import { NextRequest, NextResponse } from "next/server";
import { criarBeneficiario, buscarFamiliaPorId } from "@/models/estado";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(requisicao: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!buscarFamiliaPorId(id)) return NextResponse.json({ erro: "Família não encontrada" }, { status: 404 });
    const corpo = await requisicao.json();
    const { nome, idade, papel } = corpo;
    if (!nome || !idade || !papel) return NextResponse.json({ erro: "Campos obrigatórios: nome, idade, papel" }, { status: 400 });
    const beneficiario = criarBeneficiario({ familiaId: id, nome: nome.trim(), idade: Number(idade), papel });
    return NextResponse.json(beneficiario, { status: 201 });
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ erro: "Erro ao adicionar beneficiário" }, { status: 500 });
  }
}
