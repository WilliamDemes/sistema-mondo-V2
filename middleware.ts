// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

//Esta função roda toda vez que uma rota é acessada
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname


    //Se o usuário tentar acessar a raiz exata, ele é redirecionado para a página de login
    if (path === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

// O 'matcher' diz ao Next.js em quias rotas esse middleware deve ser ativado.
// Por enquanto, estamos vigiando apenas a raiz '/'
export const config = {
    matcher: ['/'],
}