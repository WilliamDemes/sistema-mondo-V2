import { NextResponse } from "next/server";
import { prisma } from "@/infra/database";

export async function POST(request: Request) {
    try {
        // 1. Recebe o JSON (payload) disparado pelo KoboToolbox
        const dadosKobo = await request.json();

        // 2. Extrai os dados que você precisa. 
        // OBS: O Kobo envia as perguntas com o nome que está na coluna "name" do seu XLSForm
        const idFamilia = dadosKobo["idfamilia"];
        const dataVisita = dadosKobo["Data_da_visita"];
        const visitador = dadosKobo["Nome_Visitador"];
        const rua = dadosKobo["Rua"];
        const numero = dadosKobo["Numero_da_casa"];
        const bairro = dadosKobo["Bairro"];
        const telefone = dadosKobo["Telefone_com_DDD"];
        const statusEndereco = dadosKobo["statusEndereco"];

        // 3. Salva no banco Neon via Prisma
        // (Aqui você pode usar aquela lógica de Transação que discutimos na pergunta anterior!)
        await prisma.$transaction(async (tx) => {
            // Salva a visita
            await tx.acompanhamentoFamiliar.create({
                data: {
                    idFamilia: parseInt(idFamilia),
                    dataVisita: new Date(dataVisita),
                    visitador: visitador,
                    rua,
                    numero,
                    bairro,
                    telefone,
                    statusEndereco,
                },
            });
        });

        // 3. Responde ao kobo que deu tudo certo (status 200 ok)
        return NextResponse.json(
            { message: "Dados recebidos e salvos no Neon com sucesso!" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao processar Webhook do Kobo:", error);
        return NextResponse.json(
            { error: "Falha ao processar os dados" },
            { status: 500 }
        );
    }
}