"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "./NavbarComponent/index";
import { getCurrentUser, logout } from "@/services/userService";

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
        router.push("/login");
      }}
      user={user}
    />
  );
}


