'use client';

import { Lock, Person } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { type ChangeEvent, type FormEvent, useState } from 'react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { useLogin } from '@/hooks/useLogin';
import { t } from '@/texts';

import styles from './page.module.css';

type Errors = { usuario?: string; senha?: string };

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();

  const loginMutation = useLogin();

  const validate = () => {
    const e: Errors = {};
    if (!usuario.trim()) e.usuario = t('login.user');
    if (!senha.trim()) e.senha = t('login.password');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;

    loginMutation.mutate(
      { username: usuario, password: senha },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (data : any) => {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          router.push('/casos');
        },
        onError: () => {
          const msg = t('login.invalid');
          setErrors({ usuario: msg, senha: msg });
        },
      }
    );
  };

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
              onClick={() => {}}
              data-testid="login-button"
            />
          </form>
        </div>
      </section>
    </main>
  );
}
