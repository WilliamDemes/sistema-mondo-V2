import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../infra/database";

export async function POST(request: Request) {
  try {
    // 1. Receber os dados da tela de Login
    const body = await request.json();
    const { email, password } = body;

    // 2. Auditoria básica: Campos vazios
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }, // Bad Request
      );
    }

    const emailformatado = email.toLowerCase().trim();

    // 3. Ir ao cofre e procurar a ficha do usuário pelo e-mail
    const usuario = await prisma.user.findUnique({
      where: { email: emailformatado },
    });

    // Se não encontrou nenhuma ficha com esse e-mail...
    if (!usuario) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }, // 401 = Não autorizado
      );
    }

    // 4. A prova real: Comparando as senhas
    // O bcrypt pega a senha digitada ("123456") e testa se a matemática dela
    // bate com o código embaralhado que está salvo no banco de dados.
    const senhaValida = await bcrypt.compare(password, usuario.passwordHash);

    // Se a senha não bater...
    if (!senhaValida) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    // 5. Sucesso! O segurança libera a entrada
    return NextResponse.json(
      {
        message: "Login efetuado com sucesso!",
        user: {
          id: usuario.id,
          firstName: usuario.firstName,
          lastName: usuario.lastName,
          email: usuario.email,
        },
      },
      { status: 200 }, // 200 = ok
    );
  } catch (error) {
    console.log("Erro no login", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }, // 500 = Erro do nosso lado
    );
  }
}
