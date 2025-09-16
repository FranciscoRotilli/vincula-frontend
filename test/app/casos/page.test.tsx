import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import CasosPage from "./../../../src/app/casos/page"; 
import { mockRouter } from "./../../setupTests";

describe("CasosPage", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
  });

  it('navega para "/temp" ao clicar em "Ver detalhes"', () => {
  render(<CasosPage />);

  const buttons = screen.getAllByText("Ver detalhes");
  fireEvent.click(buttons[0]);

  expect(mockRouter.push).toHaveBeenCalledWith("/temp");
});
});

