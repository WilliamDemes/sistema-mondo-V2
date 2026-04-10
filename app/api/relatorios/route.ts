import { NextResponse  } from "next/server";
import { prisma } from "@/infra/database";

export async function GET() {
    try {
        // Conectando ao bando de dados
        const relatorioCompleto = await prisma.familia.findMany({
            orderBy: {createdAt: "desc"},
            include: {   // o include inclui dados de outras bases que estão relacionadas com a base principal
                beneficiarios: true,   // Traga os beneficiários (true), e nas participações, abra as chaves e inclua a atividade.
                participacoes: {
                    include: {
                        activity: true
                    }
                }
            }
        });
        
        return NextResponse.json(relatorioCompleto, {status: 200});
    } catch (error) {
        console.error("Erro ao buscar dados do relatório", error);
        return NextResponse.json({error: "Erro ao carregar relatórios"}, {status: 500});
    }
}