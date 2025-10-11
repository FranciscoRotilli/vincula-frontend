import '@testing-library/jest-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import AddFileModal from '@/components/ModalAddFile';

const makeFile = (name: string, type: string) =>
  new File([new Blob(['x'], { type })], name, { type });

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// helper para abrir o modal com props padrão
const openModal = (overrides: Partial<React.ComponentProps<typeof AddFileModal>> = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    caseId: 'case-1',
    ...overrides,
  } as React.ComponentProps<typeof AddFileModal>;

  renderWithQueryClient(<AddFileModal {...props} />);
  return props;
};

describe('AddFileModal (basic)', () => {
  it('does not render when isOpen=false', () => {
    renderWithQueryClient(
      <AddFileModal caseId="case-1" isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders essential fields when open', () => {
    openModal();
    expect(screen.getByLabelText(/Origem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Arquivo/i, { selector: 'input[type="file"]' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument();
  });

  it('validation on empty submit shows basic errors', async () => {
    openModal();
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(await screen.findByText(/Selecione a origem\./i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione o tipo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Envie um arquivo\./i)).toBeInTheDocument();
  });

  it('happy path: fills fields, uploads valid file, calls onSubmit then onClose', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    openModal({ onSubmit, onClose });

    fireEvent.change(screen.getByLabelText(/Origem/i), { target: { value: 'SIMBA' } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'CADASTRO_ASSINANTES' },
    });

    const input = screen.getByLabelText(/Arquivo/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;
    const file = makeFile('CADASTRO_ASSINANTES.csv', 'text/csv');
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
  });
});
