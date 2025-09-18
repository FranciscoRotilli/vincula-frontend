'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { getCurrentUser, logout } from '@/services/auth';

import Navbar from './index';
import { CurrentUser } from '@/types/User';

export default function NavbarContainer() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  return (
    <Navbar
      onNavigate={(href) => router.push(href)}
      onLogout={async () => {
        await logout();
        router.push('/');
      }}
      user={user ? { name: user.username, role: user.role } : null}
    />
  );
}
