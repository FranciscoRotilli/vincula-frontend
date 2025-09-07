'use client';

import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

import Input from '@/components/Input';
import Button from '@/components/Button';
import { Person, Lock } from '@mui/icons-material';
import { useLogin } from '@/hooks/useLogin';

type Errors = { usuario?: string; senha?: string };

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();

  const loginMutation = useLogin();

  const validate = () => {
    const e: Errors = {};
    if (!usuario.trim()) e.usuario = 'O usuário deve ser informado.';
    if (!senha.trim()) e.senha = 'A senha deve ser informada.';
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
        onSuccess: (data) => {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          router.push('/casos');
        },
        onError: () => {
          const msg = 'Usuário ou senha inválido.';
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
              startIcon={<Person />}
            />

            <Input
              type="password"
              value={senha}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
              placeholder="Insira a senha"
              label="Senha"
              required
              error={errors.senha}
              startIcon={<Lock />}
            />

            <div className={styles.buttonSpacer} />

            <Button
              type="submit"
              label={loginMutation.isPending ? 'Entrando...' : 'Login'}
              disabled={loginMutation.isPending}
              onClick={() => {}}
            />
          </form>
        </div>
      </section>
    </main>
  );
}
