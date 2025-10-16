import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import Navbar from "@/components/Navbar";

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

    const toggle = screen.getByTestId("navbar-exit-button");
    fireEvent.click(toggle);

    expect(onLogout).toHaveBeenCalled();
  });

  it("navigates to /casos when logo is clicked", () => {
    const onNavigate = vi.fn();
    render(<Navbar onNavigate={onNavigate} onLogout={() => {}} user={user} />);
    const logo = screen.getByTestId("navbar-logo");
    fireEvent.click(logo);
    expect(onNavigate).toHaveBeenCalledWith("/casos");
  });
});
