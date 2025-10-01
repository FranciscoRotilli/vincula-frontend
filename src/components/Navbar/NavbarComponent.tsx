'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { getCurrentUser, logout } from '@/services/auth';
import { CurrentUser } from '@/types/User';

import Navbar from './index';

export default function NavbarContainer() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
          router.push('/');
      }
    }
    fetchUser();
  }, [router]);

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
