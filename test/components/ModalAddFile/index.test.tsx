import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import AddFileModal from '@/components/ModalAddFile';

const makeFile = (name: string, type: string) => new File([new Blob(['x'], { type })], name, { type });

const openModal = (overrides: Partial<React.ComponentProps<typeof AddFileModal>> = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  } as React.ComponentProps<typeof AddFileModal>;
  render(<AddFileModal {...props} />);
  return props;
};

describe('AddFileModal (basic)', () => {
  it('does not render when isOpen=false', () => {
    render(<AddFileModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders essential fields when open', () => {
    openModal();
    expect(screen.getByLabelText(/Origem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arquivo/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText(/Origem/i), { target: { value: 'local' } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'csv' } });

    const input = screen.getByLabelText(/Arquivo/i, { selector: 'input[type="file"]' }) as HTMLInputElement;
    const file = makeFile('dados.csv', 'text/csv');
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ origin: 'local', type: 'csv', file });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
