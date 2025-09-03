"use client";

import Navbar from "@/components/Navbar";
export default function LoginPage() {
  return (
    <>
      <Navbar
        onNavigate={(href) => console.log("ir para:", href)}
        onLogout={() => console.log("logout")}
        user={{ name: "Usuário Exemplo", role: "Admin" }}
      />
      <div>Login</div>
    </>
  );
}
