// habilita matchers como toBeInTheDocument()
import "@testing-library/jest-dom";

// mocks mínimos do Next para evitar erros em testes
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

