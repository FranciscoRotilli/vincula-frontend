/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import GeneralTab from '@/app/casos/viewCase';


// Mock CaseContainer to just render children
vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children }: any) => <div>{children}</div>,
}));

// Mock Button to render a button element
vi.mock('@/components/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{label}</button>
  ),
}));

// Mock GenericTable to render a table with data
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

// Mock Modal and CreateCaseModal
vi.mock('@/components/Modals', () => ({
  __esModule: true,
  default: ({ isOpen, title, children, onClose }: any) =>
    isOpen ? (
      <div>
        <div>{title}</div>
        {children}
        <button onClick={onClose}>Fechar</button>
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

describe('GeneralTab', () => {
  it('renders case details and tables', () => {
    render(<GeneralTab caseId="1" />);
    expect(screen.getByText('Operação Ratatouille')).toBeInTheDocument();
    expect(screen.getByText('Investigados (4)')).toBeInTheDocument();
    expect(screen.getByText('Arquivos (2)')).toBeInTheDocument();
    expect(screen.getByText('BETO BARBOSA')).toBeInTheDocument();
    expect(screen.getByText('ExtratoDetalhado.csv')).toBeInTheDocument();
  });

  it('adds a new envolvido with valid CPF', async () => {
    render(<GeneralTab caseId="1" />);
    fireEvent.change(screen.getByPlaceholderText('Insira o nome'), { target: { value: 'Novo Nome' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o CPF / CNPJ'), { target: { value: '12345678901' } });
    fireEvent.click(screen.getByRole('button', { name: '' })); // Botão de adicionar
    await waitFor(() => {
      expect(screen.getByText('Novo Nome')).toBeInTheDocument();
    });
  });

  it('does not add envolvido with invalid CPF/CNPJ', async () => {
    render(<GeneralTab caseId="1" />);
    fireEvent.change(screen.getByPlaceholderText('Insira o nome'), { target: { value: 'Nome Inválido' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o CPF / CNPJ'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: '' })); // Botão de adicionar
    await waitFor(() => {
      expect(screen.queryByText('Nome Inválido')).not.toBeInTheDocument();
    });
  });

  it('removes an envolvido after confirmation', async () => {
    render(<GeneralTab caseId="1" />);
    // Clica no botão de remover do primeiro envolvido
    fireEvent.click(screen.getAllByRole('button', { name: 'Remover' })[0]);
    // Modal de confirmação aparece
    expect(screen.getByText('Remover investigado?')).toBeInTheDocument();
    // Confirma remoção
    fireEvent.click(screen.getByText('Remover'));
    await waitFor(() => {
      expect(screen.queryByText('BETO BARBOSA')).not.toBeInTheDocument();
    });
  });

  it('shows and closes modals (alterar nome, situação, excluir caso, upload)', async () => {
    render(<GeneralTab caseId="1" />);
    // Alterar nome
    fireEvent.click(screen.getByText('Alterar nome'));
    expect(screen.getByText('Alterar nome do caso')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Alterar nome do caso')).not.toBeInTheDocument();

    // Alterar situação
    fireEvent.click(screen.getByText('Alterar situação'));
    expect(screen.getByText('Alterar situação')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Alterar situação')).not.toBeInTheDocument();

    // Excluir caso
    fireEvent.click(screen.getByText('Excluir caso'));
    expect(screen.getByText('Excluir caso')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Excluir caso')).not.toBeInTheDocument();

    // Upload
    fireEvent.click(screen.getByText('Upload'));
    expect(screen.getByText('Adicionar arquivo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByText('Adicionar arquivo')).not.toBeInTheDocument();
  });

});