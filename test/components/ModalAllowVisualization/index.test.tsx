import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import AllowVisualizationModal from '@/components/Modals/AllowVisualizationModal';
import { getCurrentUser } from '@/services/auth';
import { allowUserToViewCase } from '@/services/caseService';
import { getUsers } from '@/services/userService';

vi.mock('@/services/userService');
vi.mock('@/services/auth');
vi.mock('@/services/caseService');

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
const mockedAllowUserToViewCase = vi.mocked(allowUserToViewCase);

const openModal = (
  overrides: Partial<React.ComponentProps<typeof AllowVisualizationModal>> = {}
) => {
  const props = {
    isOpen: true,
    caseId: 'case-123',
    onClose: vi.fn(),
    onPrimary: vi.fn(),
    onSecondary: vi.fn(),
    title: 'Permitir visualização',
    primaryLabel: 'Salvar',
    secondaryLabel: 'Cancelar',
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
    render(
      <AllowVisualizationModal
        isOpen={false}
        caseId="case-123"
        onClose={vi.fn()}
        onPrimary={vi.fn()}
        onSecondary={vi.fn()}
        title="Permitir"
        primaryLabel="Salvar"
        secondaryLabel="Cancelar"
      />
    );
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

  it('permite selecionar usuário e chamar allowUserToViewCase', async () => {
    const onSubmit = vi.fn();
    mockedAllowUserToViewCase.mockResolvedValue({});

    openModal({ onSubmit });
    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());

    const select = await screen.findByTestId('mock-select');
    fireEvent.change(select, { target: { value: 'user-2' } });

    const saveButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mockedAllowUserToViewCase).toHaveBeenCalledWith('case-123', 'user-2')
    );
    expect(onSubmit).toHaveBeenCalled();
  });

  it('mostra alerta em caso de erro na chamada do backend', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockedAllowUserToViewCase.mockRejectedValue(new Error('erro'));

    openModal();
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
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
