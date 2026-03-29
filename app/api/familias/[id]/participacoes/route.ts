import { NextRequest, NextResponse } from "next/server";
import { createParticipation, getFamilyById, getActivityById } from "@/models/store";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!getFamilyById(id)) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });
    const body = await request.json();
    const { activityId, participantCount, notes } = body;
    if (!activityId || !participantCount) return NextResponse.json({ error: "Campos obrigatórios: activityId, participantCount" }, { status: 400 });
    if (!getActivityById(activityId)) return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    const participation = createParticipation({ familyId: id, activityId, participantCount: Number(participantCount), notes: notes?.trim() || null });
    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao registrar participação" }, { status: 500 });
  }
}
