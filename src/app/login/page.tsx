"use client";

import Navbar from "@/components/Navbar";
import { t } from "@/texts";

export default function LoginPage() {
  return (
    <>
      <Navbar
        onNavigate={(href) => console.log("ir para:", href)}
        onLogout={() => console.log("logout")}
        user={{ name: "Usuário Exemplo", role: "Admin" }}
      />
      <div>{t("login.title")}</div>
    </>
  );
}
