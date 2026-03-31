// utils/validacoes.ts

/**
 * Verifica se o email pertence ao domínio oficial do instituto.
 * Retorna true se for válido, false se for inválido.
*/

export function validarDominioMondo(email:string):boolean {
    // Convertendo para minúscula para evitar erros (ex: @InstitutoMondo.org.br)
    const emailFormatado = email.toLowerCase().trim();
    const dominioPermitido = "@institutomondo.org.br";

    //O método .endWith() do JavaScript verifica o final de uma string de texto
    return emailFormatado.endsWith(dominioPermitido);
}