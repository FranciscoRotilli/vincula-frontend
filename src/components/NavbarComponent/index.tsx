"use client";

import React from "react";
import colors from "@/styles/colors";
import Image from "next/image";

export type NavbarProps = {
  onNavigate: (href: string) => void;
  onLogout: () => void;
  user: { name: string; role: string } | null;
};

const navLinkStyles = `
  .navLink {
    padding: 10px;
    cursor: pointer;
    background: transparent;
    border: none;
    color: ${colors.EERIE_BLACK};
    text-decoration: none;
    font-weight: 500;
    text-align: 'bottom';
    transition: color 150ms ease-in-out;
    text-underline-offset: 4px;
  }
  .navLink:hover {
    text-decoration: underline;
  }
  .navLink.active {
    color: ${colors.UT_ORANGE};
    text-decoration: underline;
  }
`;

export default function Navbar({ onNavigate, onLogout, user }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (userMenuRef.current && event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <>
      <style>{navLinkStyles}</style>
      <header style={styles.container} aria-label="navbar-component">
        <nav aria-label="main navigation" style={styles.nav}>
          <Image src="/logo-vincula.svg" width={150} height={45} alt="Vincula Logo"
          onClick={() => {
            onNavigate("/home");
          }}/>
        </nav>

        <div ref={userMenuRef} style={styles.userArea}>
          <div style={styles.userTextGroup}>
            <div style={styles.userName}>{user?.name ?? ""}</div>
            <div style={styles.userRole}>{user?.role ?? ""}</div>
          </div>
          <button
            aria-label="Abrir menu do usuário"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((v) => !v)}
            style={styles.arrowButton}
          >
            ▾
          </button>
          {isUserMenuOpen ? (
            <div role="menu" style={styles.dropdownMenu}>
              <button role="menuitem" onClick={onLogout} style={styles.dropdownItem} aria-label="Sair">
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}


const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: colors.ANTI_FLASH_WHITE,
  },
  userName: {
    color: colors.EERIE_BLACK,
    fontWeight: 600,
    fontSize: 18,
  },
  userRole: {
    color: colors.GRAY,
    fontSize: 12,
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  userArea: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  userTextGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  arrowButton: {
    border: 0,
    background: "transparent",
    cursor: "pointer",
    color: colors.EERIE_BLACK,
    padding: 10,
    lineHeight: 1,
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    background: "white",
    borderRadius: 3,
    padding: 4,
  },
  dropdownItem: {
    border: 0,
    background: "transparent",
    padding: "8px 12px",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    color: colors.EERIE_BLACK,
  },
};