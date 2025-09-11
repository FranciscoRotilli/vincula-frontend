import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LoginPage from "../../src/app/page";
import { mockRouter } from "../setupTests";
import { renderWithClient } from "../renderWithClient";

vi.mock('@/texts', () => ({
  t: (key: string) => key,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockRouter.push.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render inputs, buttons and icons", () => {
    render(renderWithClient(<LoginPage />));

    expect(screen.getByPlaceholderText(/Insira o usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Insira a senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId("icon-person")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-password-visibility")).toBeInTheDocument();
  });

  it("should show error message when inputs are submitted empty", () => {
    render(renderWithClient(<LoginPage />));

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("login.user")).toBeInTheDocument();
    expect(screen.getByText("login.password")).toBeInTheDocument();
  });

  it("should show error message in both inputs when credentials are invalid", async () => {
    render(renderWithClient(<LoginPage />));

    fireEvent.change(screen.getByPlaceholderText(/Insira o usuário/i), {
      target: { value: "erro" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Insira a senha/i), {
      target: { value: "qualquer" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      const msgs = screen.getAllByText("login.invalid");
      expect(msgs).toHaveLength(2);
    }, { timeout: 3000 });
  });

  it("should change password visibility when clicking the icon", () => {
    render(renderWithClient(<LoginPage />));

    const input = screen.getByPlaceholderText(/Insira a senha/i) as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggle = screen.getByRole("button", { name: /toggle password visibility/i });

    fireEvent.click(toggle);
    expect(input.type).toBe("text");

    fireEvent.click(toggle);
    expect(input.type).toBe("password");
  });
});
