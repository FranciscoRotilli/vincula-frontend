import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ---- Mocks (foco no AddFileModal; não testamos o Modal genérico nem o CSS real)
vi.mock('@/components/Modals', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children, ...rest }: any) =>
    isOpen ? (
      <div role="dialog" aria-label={title} data-testid="mocked-modal" {...rest}>
        <button aria-label="Fechar" onClick={onClose} />
        {children}
      </div>
    ) : null,
}));

vi.mock('./AddFileModal.module.css', () => ({
  __esModule: true,
  default: {
    dropzone: 'dropzone',
    dragActive: 'dragActive',
    error: 'error',
    actions: 'actions',
    primaryButton: 'primaryButton',
  },
}));

import AddFileModal from '@/components/ModalAddFile';

// Helper para criar arquivos
const makeFile = (name: string, type: string) => new File([new Blob(['x'], { type })], name, { type });

const openModal = (overrides: Partial<React.ComponentProps<typeof AddFileModal>> = {}) => {
  const props = { isOpen: true, onClose: vi.fn(), onSubmit: vi.fn(), ...overrides } as React.ComponentProps<typeof AddFileModal>;
  render(<AddFileModal {...props} />);
  return props;
};

// --------------------------------------------------------
// Basic tests only
// --------------------------------------------------------

describe('AddFileModal (basic)', () => {
  test('does not render when isOpen=false', () => {
    render(<AddFileModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders essential fields when open', () => {
    openModal();
    expect(screen.getByLabelText(/Origem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arquivo/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument();
  });

  test('validation on empty submit shows basic errors', async () => {
    openModal();
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(await screen.findByText(/Selecione a origem\./i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione o tipo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Envie um arquivo\./i)).toBeInTheDocument();
  });

  test('happy path: fills fields, uploads valid file, calls onSubmit then onClose', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    openModal({ onSubmit, onClose });

    // Preenche selects
    fireEvent.change(screen.getByLabelText(/Origem/i), { target: { value: 'local' } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'csv' } });

    // Upload de arquivo válido
    const input = screen.getByLabelText(/Arquivo/i, { selector: 'input[type="file"]' }) as HTMLInputElement;
    const file = makeFile('dados.csv', 'text/csv');
    fireEvent.change(input, { target: { files: [file] } });

    // Envia
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ origin: 'local', type: 'csv', file });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
