import { SignJWT, jwtVerify } from "jose";

// 1. A tinta invisível (Chave Mestra) do Instituto Mondó
// Usamos uma variável do .env para que a senha não fique exposta no código
const chaveSecreta  = process.env.JWT_SECRET;  // busca a chave secreta no arquivo.env
const chave = new TextEncoder().encode(chaveSecreta); // Converte a chave do .env para binário para que a máquina entenda, pois ela não entende frases

// 2. A máquina de fazer crachás (criar o token)
export async function criptografar(dadosPayload: any) {
    return await new SignJWT(dadosPayload)
    .setProtectedHeader({alg: "HS256"}) // o tipo de carimbo de segurança
    .setIssuedAt() //Registra a hora exata em que o crachá foi impresso
    .setExpirationTime("24h") // O crachá tem validade de 24 horas
    .sign(chave); // Assina com nossa tinta invisivel
}

// 3. O leitor de crachás (Verificando o token)
export async function descriptografar(entrada: string): Promise<any> {
    try {
        // Tenta ler o crachá usando a mesma tinta invisivel
        const { payload } = await jwtVerify(entrada, chave, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (erro) {
        // Se o crachá for falso ou fora da validade, a porta não abre
        return null;
    }
}