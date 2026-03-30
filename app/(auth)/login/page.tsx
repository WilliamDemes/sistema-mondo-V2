"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff } from "lucide-react";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular login
    await new Promise((r) => setTimeout(r, 800));
    router.push("/");
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
          <span className={styles["login-brand-instituto"]}>instituto</span>
          <span className={styles["login-brand-mondo"]}> mondó</span>
        </div>

        <h1 className={styles["login-title"]}>Bem-vinda de volta!</h1>
        <p className={styles["login-subtitle"]}>Digite suas credenciais para acessar o sistema.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles["login-form"]} id="login-form">
          <div className={styles["login-field"]}>
            <label htmlFor="username" className={styles["login-label"]}>Nome de usuário</label>
            <input
              id="username"
              type="text"
              placeholder="Ex.:joao"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles["login-input"]}
              required
            />
          </div>

          <div className={styles["login-field"]}>
            <label htmlFor="password" className={styles["login-label"]}>Senha</label>
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
            <a href="#" className={styles["login-link"]} id="link-forgot-password">Esqueceu a senha?</a>
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
          <a href="#" className={styles["login-link"]} id="link-register">Clique aqui para se cadastrar</a>
          <div className={styles["login-support"]}>
            <span className={styles["login-support-text"]}>Precisa de ajuda?</span>
            <a href="#" className={`${styles["login-link"]} ${styles["login-link-support"]}`} id="link-support">Fale com o suporte</a>
          </div>
        </div>
      </div>

      <footer className={styles["login-copyright"]}>
        © 2025 Instituto Mondó. Todos os direitos reservados.
      </footer>
    </div>
  );
}
