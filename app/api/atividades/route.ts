import { NextResponse } from "next/server";
import { getAllActivities, createActivity, getParticipationsByActivity } from "@/models/store";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const activities = getAllActivities();
    const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const enriched = sorted.map((a) => ({
      ...a,
      participationCount: getParticipationsByActivity(a.id).length,
    }));
    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar atividades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, format, date } = body;
    if (!title || !type || !format || !date) {
      return NextResponse.json({ error: "Campos obrigatórios: title, type, format, date" }, { status: 400 });
    }
    const activity = createActivity({ title: title.trim(), description: description?.trim() || null, type, format, date });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao criar atividade" }, { status: 500 });
  }
}
