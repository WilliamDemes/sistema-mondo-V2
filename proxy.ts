// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "./utils/session"; // O nosso leitor de crachás!

// 1. O mapa do edifício: Quais rotas precisam de crachá?
const rotasProtegidas = ["/home", "/atividades", "/familias", "/relatorios", "/dashboard"];
// Rotas onde o utilizador não deve ir se JÁ tiver feito login
const rotasPublicas = ["/login", "/cadastro"];

export async function proxy(req: NextRequest) {
  // 2. Para qual porta o utilizador está a caminhar?
  const path = req.nextUrl.pathname;
  const isRotaProtegida = rotasProtegidas.includes(path);
  const isRotaPublica = rotasPublicas.includes(path);

  // 3. O segurança revista o bolso do navegador (cookie)
  const cookie = req.cookies.get("session")?.value;

  // 4. O segurança passa o scanner no crachá pa ver se é válido
  const sessao = cookie ? await decrypt(cookie) : null;

  // ---AS REGRAS DA CASA--

  // Regra A: Tentar entrar na sala de trabalho (Dashboard) sem crachá válido
  if (isRotaProtegida && !sessao) {
    // Manda de volta para a rua (Login)
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Regra B: Tentar ir para a rua (Login/Cadastro) quando já está logado (com crachá)
  if (isRotaPublica && sessao) {
    // Manda de volta para a sala de trabalho
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  // Regra C: Se o usuário acessar a raiz ('/') é redirecionado para login
  if (path === "/") {
    // Se tiver sessão, vai para a home. Se não, vai para o login.
    const destino = sessao ? "home" : "login";
    return NextResponse.redirect(new URL(destino, req.nextUrl));
  }

  // Regra C: Se estiver tudo certo, o segurança abre a porta e deixa passar!
  return NextResponse.next();
}

// 5. Otimização: Dizer ao segurança para ignorar imagens, ícones e ficheiros de sistema (CSS)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
