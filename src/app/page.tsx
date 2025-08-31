"use client";

import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

import Input from "@/components/input/Input";
import Button from "@/components/Button/Button";

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

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;
    setSubmitting(true);
    try {
      await loginMock(usuario, senha);
      router.push("/casos");
    } catch {
      const msg = "Usuário ou senha inválido.";
      setErrors({ usuario: msg, senha: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting;

  return (
    <main
      className={styles.page}>
      <div className={styles.cornerBrand} aria-hidden>
        <Image src="/mp-logo.svg" alt="" width={258} height={84} />
      </div>

      <section className={styles.center}>
        <div className={styles.card}>
          <div className={styles.logoGroup}>
            <div className={styles.logoMprs}>
              <Image
                src="/mprs-logo.svg"
                alt="MPRS - Ministério Público do Rio Grande do Sul"
                width={300}
                height={217}
                priority
              />
            </div>

            <div className={styles.logoVincula}>
              <Image src="/vincula.svg" alt="VINCULA" width={400} height={119} />
            </div>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <Input
              value={usuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
              placeholder="Insira o usuário"
              label="Usuário"
              required
              error={errors.usuario}
            />

            <Input
              type="password"
              value={senha}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
              placeholder="Insira a senha"
              label="Senha"
              required
              error={errors.senha}
            />

            <div className={styles.buttonSpacer} />

            <Button
              type="submit"
              label={isSubmitting ? "Entrando..." : "Login"}
              disabled={!canSubmit}
              onClick={() => {}}
            />

            {errors.root && <p role="alert">{errors.root}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
