"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle2, X, UserPlus } from "lucide-react";
import styles from "./Cadastro.module.css";
import { validarDominioMondo } from "../../../utils/validacoes";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ── Password strength ──
function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: "Fraca" };
  if (score <= 3) return { level: 2, label: "Média" };
  return { level: 3, label: "Forte" };
}

export default function CadastroPage() {
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Validation ──
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "Primeiro nome é obrigatório.";
    if (!lastName.trim()) newErrors.lastName = "Sobrenome é obrigatório.";

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório.";
    } else if (!validarDominioMondo(email)) {
      newErrors.email = "Use um e-mail institucional (@institutomondo.org.br).";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória.";
    } else if (password.length < 6) {
      newErrors.password = "Mínimo de 6 caracteres.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Simulação de criação de conta (substituir por chamada API real)
      await new Promise((r) => setTimeout(r, 1200));

      addToast("success", "Conta criada com sucesso! Redirecionando...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      addToast("error", "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Clear field error on change ──
  function clearError(field: string) {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }

  const strength = getPasswordStrength(password);

  return (
    <div className={styles["cadastro-page"]}>
      {/* Toast */}
      <div className={styles["toast-container"]}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[`toast-${t.type}`]}`}>
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{t.message}</span>
            <button className={styles["toast-close"]} onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles["cadastro-card"]}>
        {/* Logo */}
        <div className={styles["cadastro-logo"]}>
          <div className={styles["cadastro-logo-icon"]}>
            <Heart size={28} strokeWidth={2.5} />
          </div>
        </div>

        <div className={styles["cadastro-brand"]}>
          <span className={styles["cadastro-brand-instituto"]}>instituto</span>
          <span className={styles["cadastro-brand-mondo"]}> mondó</span>
        </div>

        <h1 className={styles["cadastro-title"]}>Crie sua conta</h1>
        <p className={styles["cadastro-subtitle"]}>
          Preencha os dados abaixo para acessar o sistema.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles["cadastro-form"]} id="cadastro-form">
          {/* Nome e Sobrenome */}
          <div className={styles["cadastro-row"]}>
            <div className={styles["cadastro-field"]}>
              <label htmlFor="firstName" className={styles["cadastro-label"]}>
                Primeiro Nome
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Ex.: Ana"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                className={`${styles["cadastro-input"]} ${errors.firstName ? styles["cadastro-input-error"] : ""}`}
                disabled={isLoading}
                autoFocus
              />
              {errors.firstName && (
                <span className={styles["cadastro-error"]}>
                  <AlertCircle size={12} />
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className={styles["cadastro-field"]}>
              <label htmlFor="lastName" className={styles["cadastro-label"]}>
                Sobrenome
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Ex.: Silva"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
                className={`${styles["cadastro-input"]} ${errors.lastName ? styles["cadastro-input-error"] : ""}`}
                disabled={isLoading}
              />
              {errors.lastName && (
                <span className={styles["cadastro-error"]}>
                  <AlertCircle size={12} />
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className={styles["cadastro-field"]}>
            <label htmlFor="email" className={styles["cadastro-label"]}>
              Email Institucional
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ex.: ana@institutomondo.org.br"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              className={`${styles["cadastro-input"]} ${errors.email ? styles["cadastro-input-error"] : ""}`}
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles["cadastro-error"]}>
                <AlertCircle size={12} />
                {errors.email}
              </span>
            )}
          </div>

          {/* Senha */}
          <div className={styles["cadastro-field"]}>
            <label htmlFor="password" className={styles["cadastro-label"]}>
              Senha
            </label>
            <div className={styles["cadastro-input-wrapper"]}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                className={`${styles["cadastro-input"]} ${errors.password ? styles["cadastro-input-error"] : ""}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles["cadastro-eye-btn"]}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className={styles["cadastro-error"]}>
                <AlertCircle size={12} />
                {errors.password}
              </span>
            )}
            {/* Strength bar */}
            {password && (
              <>
                <div className={styles["strength-bar-container"]}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`${styles["strength-bar"]} ${
                        i <= strength.level
                          ? styles[`strength-bar-active-${strength.level === 1 ? "weak" : strength.level === 2 ? "medium" : "strong"}`]
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`${styles["strength-text"]} ${
                    styles[`strength-text-${strength.level === 1 ? "weak" : strength.level === 2 ? "medium" : "strong"}`]
                  }`}
                >
                  Senha {strength.label}
                </span>
              </>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className={styles["cadastro-field"]}>
            <label htmlFor="confirmPassword" className={styles["cadastro-label"]}>
              Repetir Senha
            </label>
            <div className={styles["cadastro-input-wrapper"]}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                className={`${styles["cadastro-input"]} ${errors.confirmPassword ? styles["cadastro-input-error"] : ""}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles["cadastro-eye-btn"]}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles["cadastro-error"]}>
                <AlertCircle size={12} />
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles["cadastro-btn"]}
            id="btn-cadastrar"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles["cadastro-btn-loading"]}>
                <span className={styles["cadastro-spinner"]} />
                Criando conta...
              </span>
            ) : (
              <>
                <UserPlus size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles["cadastro-footer"]}>
          <span className={styles["cadastro-footer-text"]}>
            Já possui uma conta?{" "}
            <Link href="/login" className={styles["cadastro-link"]} id="link-login">
              Faça login
            </Link>
          </span>
        </div>
      </div>

      <footer className={styles["cadastro-copyright"]}>
        © 2025 Instituto Mondó. Todos os direitos reservados.
      </footer>
    </div>
  );
}
