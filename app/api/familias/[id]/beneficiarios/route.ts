import { NextRequest, NextResponse } from "next/server";
import { createBeneficiary, getFamilyById } from "@/models/store";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!getFamilyById(id)) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });
    const body = await request.json();
    const { name, age, role } = body;
    if (!name || !age || !role) return NextResponse.json({ error: "Campos obrigatórios: name, age, role" }, { status: 400 });
    const beneficiary = createBeneficiary({ familyId: id, name: name.trim(), age: Number(age), role });
    return NextResponse.json(beneficiary, { status: 201 });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao adicionar beneficiário" }, { status: 500 });
  }
}
