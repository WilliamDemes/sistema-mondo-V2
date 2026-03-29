import { NextRequest, NextResponse } from "next/server";
import { getAllFamilies, createFamily, getBeneficiariesByFamily, getAllParticipations } from "@/models/store";

export async function GET() {
  try {
    const families = getAllFamilies();
    const participations = getAllParticipations();
    const enriched = families.map((f) => ({
      ...f,
      membersCount: getBeneficiariesByFamily(f.id).length,
      participationsCount: participations.filter((p) => p.familyId === f.id).length,
    }));
    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Erro ao buscar famílias:", error);
    return NextResponse.json({ error: "Erro ao buscar famílias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyName, territory, address, observations, status } = body;
    if (!familyName || !territory || !address) {
      return NextResponse.json({ error: "Campos obrigatórios: familyName, territory, address" }, { status: 400 });
    }
    const family = createFamily({
      familyName: familyName.trim(),
      territory: territory.trim(),
      address: address.trim(),
      observations: observations?.trim() || null,
      status: status || "ATIVA",
    });
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar família:", error);
    return NextResponse.json({ error: "Erro ao criar família" }, { status: 500 });
  }
}
