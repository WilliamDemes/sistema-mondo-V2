import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/database"
import { propagateServerField } from "next/dist/server/lib/render-server";

// Onext.js exige que os prâmetros da URL sejam tipados
interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, props: RouteParams) {
  try {
    // 1. Lendo a URL apra descobrir de qual Família estamos falando
    const params = await props.params;
    const familiaId = params.id

    // 2. Abrindo o pacote JSON enviado pelo Front-end
    const dados = await request.json();

    // 3. Pegando os dados do JSON
    const { acaoId, contagemParticipantes, observacoes } = dados

    // 4. Fazendo o de-para com o banco de dados. Criando a ponte
    const novaParticipacao = await prisma.participacoes.create({
      data: {
        familiaId: familiaId,
        acaoId: acaoId,
        contagemParticipantes,
        observacoes
      }
    });

    //5. Avisando o Front-end que deu tudo certo
    return NextResponse.json(novaParticipacao, { status: 201})
    
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao registrar participação" }, { status: 500 });
  }
}
