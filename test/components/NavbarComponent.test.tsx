import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "../../src/components/NavbarComponent/index";
import React from "react";

describe("NavbarComponent", () => {
  const user = { name: "Cicrano", role: "Promotor" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user identity", () => {
    render(
      <Navbar onNavigate={() => {}} onLogout={() => {}} user={user} />
    );

    expect(screen.getByText("Cicrano")).toBeInTheDocument();
    expect(screen.getByText("Promotor")).toBeInTheDocument();
  });

  it("toggles user menu and calls logout", () => {
    const onLogout = vi.fn();
    render(<Navbar onNavigate={() => {}} onLogout={onLogout} user={user} />);

    const toggle = screen.getByRole("button", { name: "Abrir menu do usuário" });
    fireEvent.click(toggle);

    const logoutItem = screen.getByRole("menuitem", { name: "Sair" });
    fireEvent.click(logoutItem);
    expect(onLogout).toHaveBeenCalled();
  });

  it("navigates to /home when logo is clicked", () => {
    const onNavigate = vi.fn();
    render(<Navbar onNavigate={onNavigate} onLogout={() => {}} user={user} />);

    const logo = screen.getByRole("img", { name: /vincula logo/i });
    fireEvent.click(logo);
    expect(onNavigate).toHaveBeenCalledWith("/home");
  });
});


