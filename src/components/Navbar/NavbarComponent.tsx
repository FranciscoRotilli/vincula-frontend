'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { getCurrentUser, logout } from '@/services/userService';

import Navbar from './index';

export default function NavbarContainer() {
  const router = useRouter();
  const [user, setUser] = React.useState<Awaited<ReturnType<typeof getCurrentUser>>>(null);

  React.useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <Navbar
      onNavigate={(href) => router.push(href)}
      onLogout={async () => {
        await logout();
        router.push('/');
      }}
      user={user}
    />
  );
}
