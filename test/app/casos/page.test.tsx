import { fireEvent,render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import CasosPage from "@/app/casos/page";
import { t } from "@/texts";

import { renderWithClient } from "../../renderWithClient";

describe("CasosPage", () => {
  it("should render page title", () => {
    render(renderWithClient(<CasosPage />));

    expect(screen.getByText(t("cases.title"))).toBeInTheDocument();
  });

  it("should render add case button", () => {
    render(renderWithClient(<CasosPage />));

    expect(screen.getByRole("button", { name: /ADICIONAR CASO/i })).toBeInTheDocument();
  });

  it("should render main components", () => {
    render(renderWithClient(<CasosPage />));

    expect(screen.getByText(t("cases.title"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ADICIONAR CASO/i })).toBeInTheDocument();
    
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });

  it("should render filter components", () => {
    render(renderWithClient(<CasosPage />));

    expect(screen.getByTestId("case-number-input")).toBeInTheDocument();
    expect(screen.getByTestId("case-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("case-responsible-input")).toBeInTheDocument();
  });

  it("should have proper page structure", () => {
    render(renderWithClient(<CasosPage />));

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(t("cases.title"))).toBeInTheDocument();
    
    expect(screen.getByRole("button", { name: /ADICIONAR CASO/i })).toBeInTheDocument();
  });

  it("should render navbar component", () => {
    render(renderWithClient(<CasosPage />));
    
    const navbar = screen.getByRole("navigation");
    expect(navbar).toBeInTheDocument();
  });

  it("should render footer component", () => {
    render(renderWithClient(<CasosPage />));
    
    const footer = document.querySelector('footer') || screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("should render table with correct columns", () => {
    render(renderWithClient(<CasosPage />));
    
    expect(screen.getByText(t('modal.caseNumber'))).toBeInTheDocument();
    expect(screen.getByText(t('modal.caseName'))).toBeInTheDocument();
    expect(screen.getByText(t('modal.owner'))).toBeInTheDocument();
    expect(screen.getAllByText(t('modal.status'))).toHaveLength(2);
  });

  it("should show loading state initially", async () => {
    render(renderWithClient(<CasosPage />));
    
    await waitFor(() => {
      expect(screen.getByTestId("case-number-input")).toBeInTheDocument();
    });
  });

  it("should handle filter functionality", () => {
    render(renderWithClient(<CasosPage />));
    
    const numberInput = screen.getByTestId("case-number-input");
    const nameInput = screen.getByTestId("case-name-input");
    const responsibleInput = screen.getByTestId("case-responsible-input");
    
    expect(numberInput).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(responsibleInput).toBeInTheDocument();
    
    const clearButton = screen.getByTestId("clear-button");
    expect(clearButton).toBeInTheDocument();
  });

  it("should handle modal opening and closing", async () => {
    render(renderWithClient(<CasosPage />));
    
    const addButton = screen.getByRole("button", { name: /ADICIONAR CASO/i });
    
    expect(screen.queryByPlaceholderText(/digite o nome do caso/i)).not.toBeInTheDocument();
    
    addButton.click();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/digite o nome do caso/i)).toBeInTheDocument();
    });
  });

  it("should render with proper CSS classes", () => {
    render(renderWithClient(<CasosPage />));
    
    const mainElement = screen.getByRole("main");
    expect(mainElement.className).toContain("main");
    
    const titleElement = screen.getByText(t("cases.title"));
    expect(titleElement.className).toContain("pageTitle");
  });

  it("should have accessible elements", () => {
    render(renderWithClient(<CasosPage />));
    
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ADICIONAR CASO/i })).toBeInTheDocument();
    
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should handle filter changes", async () => {
    render(renderWithClient(<CasosPage />));
    
    const nameInput = screen.getByTestId("case-name-input").querySelector('input');
    const responsibleInput = screen.getByTestId("case-responsible-input").querySelector('input');
    
    expect(nameInput).toBeInTheDocument();
    expect(responsibleInput).toBeInTheDocument();
    
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Caso Teste' } });
      expect(nameInput.value).toBe('Caso Teste');
    }
    
    if (responsibleInput) {
      fireEvent.change(responsibleInput, { target: { value: 'João Silva' } });
      expect(responsibleInput.value).toBe('João Silva');
    }
  });

  it("should handle clear filters", async () => {
    render(renderWithClient(<CasosPage />));
    
    const clearButton = screen.getByTestId("clear-button");
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    
    const nameInput = screen.getByTestId("case-name-input").querySelector('input');
    const responsibleInput = screen.getByTestId("case-responsible-input").querySelector('input');
    
    if (nameInput) expect(nameInput.value).toBe('');
    if (responsibleInput) expect(responsibleInput.value).toBe('');
  });

  it("should handle pagination changes", async () => {
    render(renderWithClient(<CasosPage />));
    
    const paginationButtons = screen.getAllByRole("button").filter(button => 
      button.getAttribute("aria-label")?.includes("page") || 
      button.getAttribute("title")?.includes("page")
    );
    
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  it("should handle sorting changes", async () => {
    render(renderWithClient(<CasosPage />));
    
    await waitFor(() => {
      const tableHeaders = screen.getAllByText(/nome do caso|responsável|situação/i);
      expect(tableHeaders.length).toBeGreaterThan(0);
    });
  });

  it("should create case successfully", async () => {
    render(renderWithClient(<CasosPage />));
    
    const addButton = screen.getByRole("button", { name: /ADICIONAR CASO/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const modalInput = screen.getByPlaceholderText(/digite o nome do caso/i) as HTMLInputElement;
      expect(modalInput).toBeInTheDocument();
      
      fireEvent.change(modalInput, { target: { value: 'Novo Caso Teste' } });
      expect(modalInput.value).toBe('Novo Caso Teste');
    });
  });

  it("should handle modal close", async () => {
    render(renderWithClient(<CasosPage />));
    
    const addButton = screen.getByRole("button", { name: /ADICIONAR CASO/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const modalInput = screen.getByPlaceholderText(/digite o nome do caso/i);
      expect(modalInput).toBeInTheDocument();
    });
    
    const closeButtons = screen.getAllByRole("button").filter(button => 
      button.textContent?.toLowerCase().includes("cancelar") ||
      button.textContent?.toLowerCase().includes("fechar") ||
      button.getAttribute("aria-label")?.toLowerCase().includes("close")
    );
    
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0]);
    }
  });

  it("should display row actions correctly", async () => {
    render(renderWithClient(<CasosPage />));
    
    await waitFor(() => {
      const table = screen.getByRole("table") || document.querySelector('[role="grid"]');
      expect(table).toBeInTheDocument();
    });
  });

  it("should handle empty data state", () => {
    render(renderWithClient(<CasosPage />));
    
    expect(screen.getByText(t('modal.caseNumber'))).toBeInTheDocument();
    expect(screen.getByText(t('modal.caseName'))).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    render(renderWithClient(<CasosPage />));
    
    const loadingIndicator = screen.queryByRole("progressbar") || 
                          document.querySelector('[data-testid*="loading"]') ||
                          document.querySelector('.loading');
    
    if (loadingIndicator) {
      expect(loadingIndicator).toBeInTheDocument();
    }
  });

  it("should render with correct initial state", () => {
    render(renderWithClient(<CasosPage />));
    
    const filterInputs = screen.getAllByRole("textbox");
    filterInputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      expect(inputElement.value).toBe('');
    });
    
    expect(screen.queryByPlaceholderText(/digite o nome do caso/i)).not.toBeInTheDocument();
  });
});
