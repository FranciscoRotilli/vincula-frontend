'use client';


import LogoutIcon from '@mui/icons-material/Logout';
import Image from 'next/image';
import React from 'react';

import s from './index.module.css';

export type NavbarProps = {
  onNavigate: (href: string) => void;
  onLogout: () => void;
  user: { name: string; role: string } | null;
};

export default function Navbar({ onNavigate, onLogout, user }: NavbarProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className={s.container} aria-label="navbar-component" data-testid="navbar-component">
      <nav className={s.nav} aria-label="main navigation">
        <Image
          src="/vincula.svg"
          width={150}
          height={45}
          alt="Vincula Logo"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('/casos')}
        />
      </nav>

      <div ref={ref} className={s.userArea}>
        <div className={s.userTextGroup}>
          <div className={s.userName}>{user?.name ?? ''}</div>
          <div className={s.userRole}>{user?.role ?? ''}</div>
        </div>

        <button
          data-testid="navbar-exit-button"
          className={s.arrowButton}
          arial-label="Sair"
          aria-expanded={open}
          onClick={onLogout}
        >
          <LogoutIcon />
        </button>
    </div>
    </header>
  );
}

