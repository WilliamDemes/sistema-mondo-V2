import { NextRequest, NextResponse } from "next/server";
import { getActivityById, updateActivity, deleteActivity } from "@/models/store";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const activity = getActivityById(id);
    if (!activity) return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateActivity(id, body);
    if (!updated) return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ok = deleteActivity(id);
    if (!ok) return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    return NextResponse.json({ message: "Atividade excluída" });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
