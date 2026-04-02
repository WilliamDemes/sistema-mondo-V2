import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // 1. O segurança verifica no bolso do navegador
    const cookieStore = await cookies();

    // 2. Ele destrói o crachá VIP
    cookieStore.delete("session");

    // 3. Confirma que o usuário saiu com sucesso
    return NextResponse.json(
      { message: "Logout efetuado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao fazer logout." },
      { status: 500 },
    );
  }
}
