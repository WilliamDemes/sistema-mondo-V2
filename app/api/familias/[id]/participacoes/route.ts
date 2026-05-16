import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/bancoDeDados"
import { propagateServerField } from "next/dist/server/lib/render-server";

// Onext.js exige que os prâmetros da URL sejam tipados
interface RouteParams { params: Promise<{ id: string }> }

export async function POST(requisicao: NextRequest, props: RouteParams) {
  try {
    // 1. Lendo a URL apra descobrir de qual Família estamos falando
    const params = await props.params;
    const familiaId = params.id

    // 2. Abrindo o pacote JSON enviado pelo Front-end
    const dados = await requisicao.json();

    // 3. Pegando os dados do JSON
    const { idAcao, sequencialMorador, contagemParticipantes, observacoes } = dados

    // 4. Fazendo o de-para com o banco de dados. Criando a ponte
    const novaParticipacao = await prisma.participacoes.create({
      data: {
        idFamilia: familiaId, // Pode precisar ser o valor do idFamilia ao invés do id_sistema, caso o router não seja mais idFamilia
        idAcao,
        sequencialMorador: sequencialMorador || "01", // Fake fallback temporarily
        contagemParticipantes,
        observacoes
      }
    });

    //5. Avisando o Front-end que deu tudo certo
    return NextResponse.json(novaParticipacao, { status: 201})
    
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ erro: "Erro ao registrar participação" }, { status: 500 });
  }
}
