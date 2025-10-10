'use client';

/**
 * ------------------------------------------------------------
 * LOGIN (MODO MOCK DE DESIGN)
 * ------------------------------------------------------------
 * Objetivo agora: ao clicar em "Login", abrir o modal de seleção
 * múltipla para validar tamanho/cores/UX. NÃO pedir usuário/senha.
 *
 * Como voltar ao fluxo real depois:
 * - Procure os marcadores abaixo:
 *   [DESCOMENTAR PARA FLUXO REAL]  -> descomente para reativar login real
 *   [MANTER COMENTADO NO MOCK]     -> mantenha comentado enquanto só testa UI
 *   [MOCK ATIVO]                   -> bloco usado neste momento
 * ------------------------------------------------------------
 */

import Image from 'next/image';
import React, { useState /*, type ChangeEvent, type FormEvent */ } from 'react';

import MultiSelectDropdown, { type Option } from '@/components/MultiSelectDropdown';
import Button from '@/components/Button'; // ✅ mantém seu Button
import styles from './page.module.css';

// [DESCOMENTAR PARA FLUXO REAL]
// import Input from '@/components/Input';
// import { useLogin } from '@/hooks/useLogin';
// import { t } from '@/texts';

type Errors = { usuario?: string; senha?: string };

export default function LoginPage() {
  /* ------------------------------------------------------------------
   * ESTADO DO MODAL (mock visual para validação do design)
   * ------------------------------------------------------------------ */
  const [openMulti, setOpenMulti] = useState(false);

  // Opções de exemplo só para validar layout/scroll/check
  const optionsA: Option[] = [
    { value: 'a1', label: 'Opção A1' },
    { value: 'a2', label: 'Opção A2' },
    { value: 'a3', label: 'Opção A3' },
    { value: 'a4', label: 'Opção A4' },
    { value: 'a5', label: 'Opção A5' },
  ];
  const optionsB: Option[] = [
    { value: 'b1', label: 'Opção B1' },
    { value: 'b2', label: 'Opção B2' },
    { value: 'b3', label: 'Opção B3' },
    { value: 'b4', label: 'Opção B4' },
    { value: 'b5', label: 'Opção B5' },
  ];

  /* ------------------------------------------------------------------
   * BLOCO ORIGINAL DO LOGIN (preservado e comentado)
   * ------------------------------------------------------------------
   * Quando quiser reativar:
   * 1) descomente imports (Input/useLogin/t) lá em cima
   * 2) descomente este estado/validação/submit
   * 3) descomente o <form> no JSX (mais abaixo)
   * 4) comente o bloco [MOCK ATIVO] do botão simples que abre o modal
   * ------------------------------------------------------------------ */

  // [DESCOMENTAR PARA FLUXO REAL]
  // const [usuario, setUsuario] = useState('');
  // const [senha, setSenha] = useState('');
  // const [errors, setErrors] = useState<Errors>({});
  // const loginMutation = useLogin();

  // [DESCOMENTAR PARA FLUXO REAL]
  // const validate = () => {
  //   const e: Errors = {};
  //   if (!usuario.trim()) e.usuario = t('login.user');
  //   if (!senha.trim()) e.senha = t('login.password');
  //   setErrors(e);
  //   return Object.keys(e).length === 0;
  // };

  // [DESCOMENTAR PARA FLUXO REAL]
  // const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
  //   ev.preventDefault();
  //   setErrors({});
  //   if (!validate()) return;
  //   loginMutation.mutate(
  //     { username: usuario, password: senha },
  //     {
  //       onSuccess: (data: any) => {
  //         localStorage.setItem('access_token', data.access_token);
  //         localStorage.setItem('refresh_token', data.refresh_token);
  //         window.location.href = '/casos';
  //       },
  //       onError: () => {
  //         const msg = t('login.invalid');
  //         setErrors({ usuario: msg, senha: msg });
  //       },
  //     }
  //   );
  // };

  return (
    <main className={styles.page}>
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

          {/* ----------------------------------------------------------------
           * [MOCK ATIVO] — Sem formulário, sem inputs. Mantemos apenas o
           * botão "Login" do projeto para abrir o modal e validar o design.
           * Para continuar testando o design, mantenha ESTE bloco ativo.
           * ---------------------------------------------------------------- */}
          <div className={styles.form} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="button"
              label="Login"
              onClick={() => setOpenMulti(true)}
              data-testid="login-button"
            />
          </div>

          {/* ----------------------------------------------------------------
           * [MANTER COMENTADO NO MOCK] — Formulário original do login
           * Reative quando quiser voltar ao fluxo real:
           *   1) descomente este <form>
           *   2) descomente estados/validação/submit acima
           *   3) comente o bloco [MOCK ATIVO] do botão simples
           * ---------------------------------------------------------------- */}
          {/*
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <Input
              value={usuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
              placeholder="Insira o usuário"
              label="Usuário"
              required
              error={errors.usuario}
              startIcon={<Person data-testid="icon-person" />}
              data-testid="username-input"
            />

            <Input
              type="password"
              value={senha}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
              placeholder="Insira a senha"
              label="Senha"
              required
              error={errors.senha}
              startIcon={<Lock data-testid="lock-icon" />}
              data-testid="password-input"
            />

            <div className={styles.buttonSpacer} />

            <Button
              type="submit"
              label={loginMutation.isPending ? 'Entrando...' : 'Login'}
              disabled={loginMutation.isPending}
              data-testid="login-button"
            />
          </form>
          */}
        </div>
      </section>

      {/* Modal — validação de tamanho/cores/UX */}
      <MultiSelectDropdown
        open={openMulti}
        onClose={() => setOpenMulti(false)}
        optionsA={optionsA}
        optionsB={optionsB}
        labelA="Rótulo"
        labelB="Rótulo"
        onConfirm={({ a, b }) => {
          console.log('Selecionados', { a, b });
          setOpenMulti(false);
        }}
      />
    </main>
  );
}
