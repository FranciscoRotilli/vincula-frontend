import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LoginPage from "../../src/app/page";
import { mockRouter } from "../setupTests";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockRouter.push.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza campos, botão e ícones", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/Insira o usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Insira a senha/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

    expect(screen.getByTestId("icon-person")).toBeInTheDocument();
    expect(screen.getByTestId("icon-lock")).toBeInTheDocument();
  });

  it("mostra erros nos inputs ao submeter vazio", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("O usuário deve ser informado.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ser informada.")).toBeInTheDocument();
  });

  it("fluxo de sucesso: redireciona para /casos", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Insira o usuário/i), {
      target: { value: "guilherme" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Insira a senha/i), {
      target: { value: "segredo" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("button", { name: /Entrando\.\.\./i })).toBeDisabled();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/casos");
    }, { timeout: 3000 });
  });

  it("credenciais inválidas: exibe erros nos dois campos", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Insira o usuário/i), {
      target: { value: "erro" }, // aciona a falha do loginMock
    });
    fireEvent.change(screen.getByPlaceholderText(/Insira a senha/i), {
      target: { value: "qualquer" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      const msgs = screen.getAllByText("Usuário ou senha inválido.");
      expect(msgs).toHaveLength(2);
    }, { timeout: 3000 });
  });

  it("olho da senha alterna visibilidade", () => {
    render(<LoginPage />);

    const input = screen.getByPlaceholderText(/Insira a senha/i) as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggle = screen.getByRole("button", { name: /toggle password visibility/i });

    fireEvent.click(toggle);
    expect(input.type).toBe("text");

    fireEvent.click(toggle);
    expect(input.type).toBe("password");
  });
});
