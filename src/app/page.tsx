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
import FilesSection from '@/components/FilesSection';

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
        onSuccess: (data) => {
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
          <FilesSection />
        </div>
      </section>
    </main>
  );
}
