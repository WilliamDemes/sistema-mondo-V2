import { NextRequest, NextResponse } from "next/server";
import { getFamilyById, updateFamily, deleteFamily, getBeneficiariesByFamily, getParticipationsByFamily } from "@/models/store";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const family = getFamilyById(id);
    if (!family) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });
    const beneficiaries = getBeneficiariesByFamily(id);
    const participations = getParticipationsByFamily(id);
    return NextResponse.json({ ...family, beneficiaries, participations });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar família" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateFamily(id, body);
    if (!updated) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao atualizar família" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ok = deleteFamily(id);
    if (!ok) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });
    return NextResponse.json({ message: "Família excluída" });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao excluir família" }, { status: 500 });
  }
}
