import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, test, vi } from 'vitest';

// Mocks dos componentes e serviços
vi.mock('@/services/userService', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ name: 'Utilizador Teste' }),
  logout: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/components/Navbar/NavbarComponent', () => ({
  default: () => <div data-testid="navbar-mock" />,
}));
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer-mock" />,
}));

vi.mock('../../../src/components/CaseContainer/CaseTabs', () => ({
  __esModule: true,
  default: () => <div data-testid="case-tabs-mock" />,
}));

// Mock do CSS e navegação
vi.mock('./CaseContainer.module.css', () => ({ default: {} }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

describe('Componente CaseContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Testa se o container renderiza a estrutura principal: Navbar, Footer, Abas e o conteúdo passado.
  test('deve renderizar a Navbar, o Footer, as Abas e o conteúdo filho', async () => {
    const { CaseContainer } = await import('../../../src/components/CaseContainer/CaseContainer');
    
    render(
      <CaseContainer caseId="test-id">
        <p>Conteúdo de teste</p>
      </CaseContainer>
    );

    expect(screen.getByTestId('navbar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    expect(screen.getByTestId('case-tabs-mock')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
  });
});

