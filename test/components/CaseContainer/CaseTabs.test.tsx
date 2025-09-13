import '@testing-library/jest-dom';

import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import CaseTabs from '../../../src/components/CaseContainer/CaseTabs';

// Mock dos hooks de navegação do Next.js
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/casos/123', // Definimos uma rota padrão para os testes
}));

describe('Componente CaseTabs', () => {
  test('deve renderizar as três abas com os labels corretos', () => {
    render(<CaseTabs caseId="123" />);

    expect(screen.getByRole('tab', { name: 'Informações gerais' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Vínculos' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Visualização dos dados' })).toBeInTheDocument();
  });

  test('deve destacar a aba "Informações gerais" como ativa na rota base', () => {
    render(<CaseTabs caseId="123" />);
    
    const generalInfoTab = screen.getByRole('tab', { name: 'Informações gerais' });
    // O Material-UI adiciona o atributo aria-selected="true" à aba ativa
    expect(generalInfoTab).toHaveAttribute('aria-selected', 'true');
  });

  test('deve chamar router.push com a URL correta ao clicar na aba de Vínculos', () => {
    render(<CaseTabs caseId="123" />);

    const vinculosTab = screen.getByRole('tab', { name: 'Vínculos' });
    fireEvent.click(vinculosTab);

    // Verificamos se a função push do router foi chamada com o caminho correto
    expect(mockPush).toHaveBeenCalledWith('/casos/123/vinculos');
  });
});
