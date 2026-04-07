"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, EyeOff } from "lucide-react";
import styles from "./Login.module.css";
// Importando a função de validação que criamos
import { validarDominioMondo } from "../../../utils/validacoes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [erroDominio, setErroDominio] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErroDominio("");

    // Rodando a validação de email.
    const isDominioValido = validarDominioMondo(email);

    //Se for válido paramos o processo aqui mesmo.
    if (!isDominioValido) {
      setErroDominio(
        "Acesso restrito a e-mails institucionais (@institutomondo.org.br).",
      );
      setIsLoading(false); // <-- Adicione esta linha!
      return; // O 'return' cancela o resto da função, evitando que o login seja simulado.
    }
    // 2. O Carteiro (fetch) vai até o Segurança (API). Aqui começa avalidação da api
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password, // Enviamos a senha digitada
        }),
      });

      const dados = await resposta.json();

      // 3. Se o segurança barrar (Erro 401, 400, etc)
      if (!resposta.ok) {
        // Lançamos o erro genérico que programamos: "E-mail ou senha incorretos."
        throw new Error(dados.error || "Erro ao fazer login.");
      }

      // 4. Se o crachá for válido, redirecionamos para o sistema!
      // (Estou a redirecionar para "/home", altere para "/" se preferir)
      router.push("/home");
    } catch (erro: any) {
      // Reutilizamos o seu estado `erroDominio` para mostrar o erro da API em vermelho na tela
      setErroDominio(erro.message);
    } finally {
      setIsLoading(false); // Independentemente de dar certo ou errado, o botão para de girar
    }
  };

  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-card"]}>
        {/* Logo */}
        <div className={styles["login-logo"]}>
          <div className={styles["login-logo-icon"]}>
            <Heart size={28} strokeWidth={2.5} />
          </div>
        </div>

        <div className={styles["login-brand"]}>
          <span className={styles["login-brand-instituto"]}>Instituto</span>
          <span className={styles["login-brand-mondo"]}> Mondó</span>
        </div>

        <h1 className={styles["login-title"]}>Bem-vinda de volta!</h1>
        <p className={styles["login-subtitle"]}>
          Digite suas credenciais para acessar o sistema.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={styles["login-form"]}
          id="login-form"
        >
          <div className={styles["login-field"]}>
            <label htmlFor="username" className={styles["login-label"]}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ex.:joao@institutomondo.org.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles["login-input"]}
              required
            />
          </div>
          {/* Mostra a mensagem vermelha apenas se o estado 'erroDominio' estiver
          preenchido */}
          {erroDominio && (
            <p className="text-red-500 text-sm mt-2">{erroDominio}</p>
          )}

          <div className={styles["login-field"]}>
            <label htmlFor="password" className={styles["login-label"]}>
              Senha
            </label>
            <div className={styles["login-input-wrapper"]}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles["login-input"]}
                required
              />
              <button
                type="button"
                className={styles["login-eye-btn"]}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className={styles["login-forgot"]}>
            <a
              href="#"
              className={styles["login-link"]}
              id="link-forgot-password"
            >
              Esqueceu a senha?
            </a>
          </div>
          <button
            type="submit"
            className={styles["login-btn"]}
            id="btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles["login-btn-loading"]}>
                <span className={styles["login-spinner"]} />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className={styles["login-footer"]}>
          <Link
            href="/cadastro"
            className={styles["login-link"]}
            id="link-register"
          >
            Clique aqui para se cadastrar
          </Link>
          <div className={styles["login-support"]}>
            <span className={styles["login-support-text"]}>
              Precisa de ajuda?
            </span>
            <a
              href="#"
              className={`${styles["login-link"]} ${styles["login-link-support"]}`}
              id="link-support"
            >
              Fale com o suporte
            </a>
          </div>
        </div>
      </div>

      <footer className={styles["login-copyright"]}>
        © 2025 Instituto Mondó. Todos os direitos reservados.
      </footer>
    </div>
  );
}
