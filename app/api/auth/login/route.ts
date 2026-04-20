import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../infra/database";
import { encrypt } from "../../../../utils/session" // 1. Importando o fabricante de crachás
import { cookies } from "next/headers"; // 2. Importamos o bolso do navegador (cookies)

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

    // --- 5. A MÁGICA DO CRACHÁ VIP COMEÇA AQUI ---

    // 5.1 Separamos os dados que vão estar visíveis no crachá (Payload)
    const payload = {
      id: usuario.idSistema,
      firstName: usuario.firstName,
      email: usuario.email
    }

    // 5.2 Fabricamos o crachá usando a nossa chave secreta
    const token = await encrypt(payload);

    // 5.3 Colocamos o crachá no bolso do navegador (Cookie)
    // Nota: Dependendo da versão exata do Next.js, pode existir "await cookies()"
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true, // super seguro: Impede que hackers leiam o crachá com códigos maliciosos
      secure: process.env.NODE_ENV ==="production", // Em produção exige site com cadeado (HTTPS)
      sameSite: "lax",
      path: "/", // O crachá serve para todas as páginas do Instituto Mondó
      maxAge: 60 * 60 * 24, // Dura exatamente 24 horas (em segundos)
    });

    // 5.4 O segurança abre a porta!
    return NextResponse.json(
      {
        message: "Login efetuado com sucesso!",
        user: {
          id: usuario.idSistema,
          firstName: usuario.firstName,
          lastName: usuario.lastName,
          email: usuario.email,
        },
      },
      { status: 200}
    );

  } catch (error) {
    console.log("Erro no login", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }, // 500 = Erro do nosso lado
    );
  }
}
