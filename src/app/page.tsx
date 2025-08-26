"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

async function loginMock(usuario: string, senha: string) {
  await new Promise((r) => setTimeout(r, 600));
  if (usuario === "erro" || senha === "erro") throw new Error("Credenciais inválidas.");
  if (usuario.trim() && senha.trim()) return { ok: true, token: "mock-token" };
  throw new Error("Usuário e senha são obrigatórios.");
}

type Errors = { usuario?: string; senha?: string; root?: string };

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();

  const validate = () => {
    const e: Errors = {};
    if (!usuario.trim()) e.usuario = "O usuário deve ser informado.";
    if (!senha.trim()) e.senha = "A senha deve ser informada.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;
    setSubmitting(true);
    try {
      await loginMock(usuario, senha);
      router.push("/casos");
    } catch (err: any) {
      const msg = "Usuário ou senha inválido.";
      setErrors({ usuario: msg, senha: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting;

  return (
    <main
      className={styles.page}
      style={{
        backgroundImage: "url('/backgrounds/login-background.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
      >
      <div className={styles.cornerBrand} aria-hidden>
        <Image src="/logos/mp-logo.svg" alt="" width={258} height={84} />
      </div>

      <section className={styles.center}>
        <div className={styles.card}>
          <div className={styles.logoGroup}>
            <div className={styles.logoMprs}>
              <Image
                src="/logos/mprs-logo.svg"
                alt="MPRS - Ministério Público do Rio Grande do Sul"
                width={300}
                height={217}
                priority
              />
            </div>

            <div className={styles.logoVincula}>
              <Image
                src="/logos/logo-vincula.svg"
                alt="VINCULA"
                width={400}
                height={119}
              />
            </div>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <label className={styles.label}>Usuário *</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIconLeft}>
                <img src="/icons/user.svg" alt="" width={16} height={16} aria-hidden />
              </span>
              <input
                className={`${styles.input} ${styles.withLeft}`}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder={"Insira o usuário"}
                aria-invalid={!!errors.usuario}
              />
            </div>
            {errors.usuario && <span className={styles.errorText}>{errors.usuario}</span>}

            <label className={styles.label}>Senha *</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIconLeft}>
                <img src="/icons/lock.svg" alt="" width={16} height={16} aria-hidden />
              </span>
              <input
                className={`${styles.input} ${styles.withLeft} ${styles.withRight}`}
                type={mostrar ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={"Insira a senha"}
                aria-invalid={!!errors.senha}
              />
              <button
                type="button"
                className={`${styles.inputIconRight} ${styles.iconBtn}`}
                aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setMostrar((v) => !v)}
              >
                <img
                  src="/icons/eye.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                  className={mostrar ? styles.eyeActive : styles.eyeInactive}
                />
              </button>
            </div>
            {errors.senha && <span className={styles.errorText}>{errors.senha}</span>}

            <div className={styles.buttonSpacer} />

            <button type="submit" className={styles.btn} disabled={!canSubmit}>
              {isSubmitting ? "Entrando..." : "Login"}
            </button>

            {errors.root && <p role="alert" className={styles.errorText}>{errors.root}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
