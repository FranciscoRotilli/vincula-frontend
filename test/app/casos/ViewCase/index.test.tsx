/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import GeneralTab from '@/app/casos/viewCase';

const queryClient = new QueryClient();

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{label}</button>
  ),
}));

vi.mock('@/components/GenericTable', () => ({
  __esModule: true,
  default: ({ data, columns, rowActions }: any) => (
    <table>
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {rowActions && <th>{"Ação"}</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, idx: number) => (
          <tr key={row.id}>
            {columns.map((col: any) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
            {rowActions && (
              <td>
                {rowActions.map((action: any, i: number) => (
                  <button
                    key={i}
                    aria-label={action.label}
                    onClick={() => action.onClick(row, idx)}
                  >
                    {action.label}
                  </button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('@/components/Modals', () => ({
  __esModule: true,
  default: ({ isOpen, title, children, onClose }: any) =>
    isOpen ? (
      <div>
        <div>{title}</div>
        {children}
        <button onClick={onClose}>{"Fechar"}</button>
      </div>
    ) : null,
}));
vi.mock('@/components/Modals/CreateCaseModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div>
        <div>{"Alterar nome do caso"}</div>
        <button onClick={onClose}>{"Fechar"}</button>
      </div>
    ) : null,
}));

vi.mock('@/hooks/useCase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useCase')>();
  return {
    ...actual,
    useCaseById: () => ({
      data: {
        id: '1',
        name: 'Operação Ratatouille',
        owner: 'Cicrano',
        status: 'Em andamento',
        creation_date: '10 de Agosto 2025',
      },
      isLoading: false,
      isError: false,
    }),
  };
});

describe('GeneralTab', () => {
  it('renders case details and tables', () => {
    renderWithQueryClient(<GeneralTab caseId="1" />);
    expect(screen.getByText('Operação Ratatouille')).toBeInTheDocument();
    expect(screen.getByText('Investigados (4)')).toBeInTheDocument();
    expect(screen.getByText('Arquivos (2)')).toBeInTheDocument();
    expect(screen.getByText('BETO BARBOSA')).toBeInTheDocument();
    expect(screen.getByText('ExtratoDetalhado.csv')).toBeInTheDocument();
  });

  it('adds a new envolvido with valid CPF', async () => {
    renderWithQueryClient(<GeneralTab caseId="1" />);
    fireEvent.change(screen.getByPlaceholderText('Insira o nome'), { target: { value: 'Novo Nome' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o CPF / CNPJ'), { target: { value: '12345678901' } });
    fireEvent.click(screen.getByRole('button', { name: '' })); // Botão de adicionar
    await waitFor(() => {
      expect(screen.getByText('Novo Nome')).toBeInTheDocument();
    });
  });

  it('does not add envolvido with invalid CPF/CNPJ', async () => {
    renderWithQueryClient(<GeneralTab caseId="1" />);
    fireEvent.change(screen.getByPlaceholderText('Insira o nome'), { target: { value: 'Nome Inválido' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o CPF / CNPJ'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: '' })); // Botão de adicionar
    await waitFor(() => {
      expect(screen.queryByText('Nome Inválido')).not.toBeInTheDocument();
    });
  });

  it('removes an envolvido after confirmation', async () => {
    renderWithQueryClient(<GeneralTab caseId="1" />);
    fireEvent.click(screen.getAllByText('Remover')[0]);
    const removerButtons = screen.getAllByText('Remover');
    fireEvent.click(removerButtons[removerButtons.length - 1]);
    await waitFor(() => {
      expect(screen.queryByText('BETO BARBOSA')).not.toBeInTheDocument();
    });
  });

  it('shows and closes modals (alterar nome, situação, excluir caso, upload)', async () => {
    renderWithQueryClient(<GeneralTab caseId="1" />);

		fireEvent.click(screen.getByText('Alterar nome'));
    expect(screen.getByText('Alterar nome do caso')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Alterar nome do caso')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Alterar situação'));
    const alterarSituacaoDivs = screen.getAllByText('Alterar situação');
    const modalAlterarSituacao = alterarSituacaoDivs.find(div =>
      div.tagName === 'DIV'
		);
		
    expect(modalAlterarSituacao).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    const alterarSituacaoDivsApos = screen.getAllByText('Alterar situação');
    const modalAlterarSituacaoApos = alterarSituacaoDivsApos.find(div =>
      div.tagName === 'DIV'
    );
    expect(modalAlterarSituacaoApos ?? null).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Excluir caso')[0]);
    expect(screen.getAllByText('Excluir caso')).toHaveLength(2);
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.getAllByText('Excluir caso')).toHaveLength(1);

    fireEvent.click(screen.getByText('Upload'));
    expect(screen.getByText('Adicionar arquivo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Adicionar arquivo')).not.toBeInTheDocument();
  });

});