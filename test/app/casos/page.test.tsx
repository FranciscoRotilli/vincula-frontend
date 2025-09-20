import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import CasosPage from "./../../../src/app/casos/page"; 
import { mockRouter } from "./../../setupTests";

describe("CasosPage", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
  });

//não vai funcionar até a página de informações gerais do caso estar na develop
  it('should navigate to /casos/viewcase when clicking "Ver detalhes" button', () => {
  render(<CasosPage />);

  const buttons = screen.getAllByText("Ver detalhes");
  fireEvent.click(buttons[0]);

  expect(mockRouter.push).toHaveBeenCalledWith("/casos/viewcase");
});
});
