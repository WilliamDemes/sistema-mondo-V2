import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../infra/database";

export async function POST(request: Request) {
  try {
    // 1. Receber o envelope da repção (Frontend)
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    //2. Primeira Auditoria: Verifica se falta alguma coisa. Se algum campo estiver vazio ele reorna um objeto como erro e código do erro
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }, // 400 = Bad Request (Pedido mal formulado)
      );
    }

    // 3. Segunda auditoria: Regra de negócio institucional
    const emailFormatado = email.toLowerCase().trim();
    if (!emailFormatado.endsWith("@institutomondo.org.br")) {
      return NextResponse.json(
        { error: "Acesso restrito a e-mails institucionais" },
        { status: 403 }, // 403 Forbidden (Proibido)
      );
    }

    // 4. Consulta ao Arquivo: o usuário já existe?
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Este email já está registrado no sistema" },
        { status: 409 }, // 409 = Conflict (conflito de dados)
      );
    }

    // 5. O carimbo de sigilo: Criptografando a senha
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. O arquivamento: registrando usuário na base de dados usando o prisma
    const novoUsuario = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: emailFormatado,
        passwordHash: passwordHash,
      },
    });

    // 7. Resposta de sucesso: Avisa a recepção que ocorreu tudo bem
    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        user: {
          id: novoUsuario.id,
          name: novoUsuario.name,
          email: novoUsuario.email,
        },
      },
      { status: 201 }, // 201 = Created (Criado com sucesso)
    );
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    // 500 = Internal Server Error (Erro do lado do servidor, o servidor está com problema)
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 },
    );
  }
}
