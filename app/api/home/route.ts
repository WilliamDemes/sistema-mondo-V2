import { NextResponse } from "next/server";
import { prisma } from "@/infra/bancoDeDados";

export async function GET() {
    try {
        const acoes = await prisma.acoes.findMany({
            select: {
                nomeAcao: true,
                data: true,
                categoria: true
            },
            orderBy: {
                data: "asc"  // Traz os acoes mais recentemente primeiro
            }
        });
        console.log(acoes)
        return NextResponse.json(acoes)

    } catch (erro) {
        console.error("Erro no calendário da Home: ", erro);
        return NextResponse.json(
            { erro: "Erro ao buscar atividades" },
            { status: 500 },
        )
    }
};
