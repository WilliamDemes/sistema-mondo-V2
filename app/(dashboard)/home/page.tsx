import Link from "next/link";
import styles from "./Home.module.css";
import { cookies } from "next/headers";
import { descriptografar } from "../../../utils/sessao";
import { prisma } from "@/infra/bancoDeDados";
import CalendarioClienteUI from "./CalendarioClienteUI";

export default async function HomePage() {
  // ------ AUTENTICAÇÃO ---------
  // 1. Abre o cofre de cookies
  const cookieStore = await cookies();

  // 2. Pega o valor do crachá chamado "session"
  const token = cookieStore.get("session")?.value;

  // 3. Passa o scanner (descriptografar) para ler os dados
  const sessao = token ? await descriptografar(token) : null;

  // 4. Pegamos o primeiro nome
  const nomeUsuario = sessao?.firstName || "Usuário";

  // 5. Formatando o nome
  const nomeFormatado =
    nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1).toLowerCase();

  // ----------- BUSCANDO OS DADOS REAIS NO BANCO ------------------
  // Apenas deixados aqui para o desenvolvedor usar futuramente
  // e não quebrar o que já existia

  return (
    <div className={styles["home-page"]}>
      {/* Welcome section */}
      <section className={styles["home-welcome"]}>
        <h1 className={styles["home-welcome-title"]}>
          Bem-vindo(a), {nomeFormatado}
        </h1>
        <p className={styles["home-welcome-subtitle"]}>
          Gerencie atendimentos, atividades, participações e a agenda
          do Instituto Mondó de forma simples e organizada.
        </p>
      </section>

      {/* CALENDÁRIO CLIENT UI INJETADO COM DADOS FICTÍCIOS */}
      <CalendarioClienteUI />
      
    </div>
  );
}
