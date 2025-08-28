"use client";

import React from "react";
import Image from "next/image";
import colors from "@/styles/colors";
import s from "./index.module.css";

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
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // expose palette
  const cssVars: React.CSSProperties = {
    ["--color-eerie-black" as any]: colors.EERIE_BLACK,
    ["--color-ut-orange" as any]: colors.UT_ORANGE,
    ["--color-anti-flash-white" as any]: colors.ANTI_FLASH_WHITE,
    ["--color-gray" as any]: colors.GRAY,
  };

  return (
    <header className={s.container} style={cssVars} aria-label="navbar-component">
      <nav className={s.nav} aria-label="main navigation">
        <Image
          src="/logo-vincula.svg"
          width={150}
          height={45}
          alt="Vincula Logo"
          style={{ cursor: "pointer" }}
          onClick={() => onNavigate("/home")}
        />
      </nav>

      <div ref={ref} className={s.userArea}>
        <div className={s.userTextGroup}>
          <div className={s.userName}>{user?.name ?? ""}</div>
          <div className={s.userRole}>{user?.role ?? ""}</div>
        </div>
        <button
          className={s.arrowButton}
          aria-label="Abrir menu do usuário"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          ▾
        </button>
        {open && (
          <div role="menu" className={s.dropdownMenu}>
            <button role="menuitem" onClick={onLogout} className={s.dropdownItem} aria-label="Sair">
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
