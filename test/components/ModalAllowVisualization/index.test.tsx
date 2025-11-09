import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import AllowVisualizationModal from '@/components/Modals/AllowVisualizationModal';
import { getCurrentUser } from '@/services/auth';
import { getUsers } from '@/services/userService';

vi.mock('@/services/userService');
vi.mock('@/services/auth');

vi.mock('@/components/Select', () => ({
  CustomSelect: ({ options, value, onChange, placeholder }: any) => (
    <select
      data-testid="mock-select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

const mockedGetUsers = vi.mocked(getUsers);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const openModal = (
  overrides: Partial<React.ComponentProps<typeof AllowVisualizationModal>> = {}
) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  } as React.ComponentProps<typeof AllowVisualizationModal>;
  render(<AllowVisualizationModal {...props} />);
  return props;
};

describe('AllowVisualizationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      username: 'rafael',
      name: 'Rafael',
    });

    mockedGetUsers.mockResolvedValue([
      { id: 'user-1', name: 'Rafael' },
      { id: 'user-2', name: 'Alice' },
      { id: 'user-3', name: 'João' },
    ]);
  });

  it('não renderiza quando isOpen = false', () => {
    render(<AllowVisualizationModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByText(/Permitir/i)).not.toBeInTheDocument();
  });

  it('renderiza título e botões principais quando aberto', async () => {
    openModal();

    expect(await screen.findByText(/Permitir visualização/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('carrega e filtra usuários corretamente', async () => {
    openModal();
    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());
  });

  it('desabilita o botão salvar enquanto a submissão está em andamento', async () => {
    openModal({ isSubmitting: true });
    expect(await screen.findByRole('button', { name: /Salvando/i })).toBeDisabled();
  });

  it('permite selecionar usuário e chama onSubmit com o id selecionado', async () => {
    const onSubmit = vi.fn();

    openModal({ onSubmit });
    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());

    const select = await screen.findByTestId('mock-select');
    fireEvent.change(select, { target: { value: 'user-2' } });

    const saveButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('user-2'));
  });

  it('mostra alerta em caso de erro na chamada do backend', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error('erro'));

    openModal({ onSubmit });
    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());

    const select = await screen.findByTestId('mock-select');
    fireEvent.change(select, { target: { value: 'user-3' } });

    const saveButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Erro ao salvar usuário.'));
    alertMock.mockRestore();
  });

  it('chama onClose ao clicar em Cancelar', async () => {
    const onClose = vi.fn();
    openModal({ onClose });
    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());
    const cancelButton = await screen.findByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});
