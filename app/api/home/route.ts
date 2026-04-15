import { NextResponse } from "next/server";
import { prisma } from "@/infra/database";

export async function GET() {
    try {
        const acoes = await prisma.activity.findMany({
            select: {
                nomeAcao: true,
                date: true,
                tipo: true
            },
            orderBy: {
                date: "asc"  // Traz os acoes mais recentemente primeiro
            }
        });
        console.log(acoes)
        return NextResponse.json(acoes)

    } catch (error) {
        console.error("Erro no calendário da Home: ", error);
        return NextResponse.json(
            { error: "Erro ao buscar atividades" },
            { status: 500 },
        )
    }
};