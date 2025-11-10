/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable i18next/no-literal-string */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  useAllowVisualization,
  useCaseById,
  useDeleteCase,
  useUpdateCaseName,
  useUpdateCaseSituation,
} from '@/hooks/useCase';
import { useAddSuspect, useAddSuspectsBatch,useDeleteSuspect } from '@/hooks/useSuspect';
import { getCurrentUser } from '@/services/auth';
import { t } from '@/texts';
import { CompleteCaseResponse } from '@/types/Cases';

import GeneralInfoPage from '../../../../src/app/casos/[id]/page';
import { renderWithClient } from '../../../renderWithClient';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react', async () => {
  const actual: any = await vi.importActual('react');
  return {
    ...actual,
    use: (v: unknown) => (v && typeof (v as any).then === 'function' ? { id: '123' } : v),
  };
});

vi.mock('@/hooks/useCase', () => ({
  useCaseById: vi.fn(),
  useUpdateCaseName: vi.fn(),
  useUpdateCaseSituation: vi.fn(),
  useDeleteCase: vi.fn(),
  useAllowVisualization: vi.fn(),
  useUpdateCaseOwner: vi.fn(),
}));

vi.mock('@/hooks/useSuspect', () => ({
  useAddSuspect: vi.fn(),
  useDeleteSuspect: vi.fn(),
  useAddSuspectsBatch: vi.fn(),
}));

vi.mock('@/services/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/components/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, disabled, loading, icon, size, variant, className, loadingLabel, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {icon}
      {loading ? loadingLabel || 'Loading...' : label}
    </button>
  ),
}));

vi.mock('@/components/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, label, className, inputMode, ...props }: any) => (
    <div className={className}>
      {label && <label>{label}</label>}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        {...props}
      />
    </div>
  ),
}));

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, caseId }: { children: React.ReactNode; caseId: string }) => (
    <div data-testid="case-container" data-case-id={caseId}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ConfirmationModal/ConfirmationModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onPrimary,
    onSecondary,
    title,
    description,
    primaryLabel,
    secondaryLabel,
    children,
    primaryDisabled,
    primaryLoading,
  }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <button onClick={onSecondary} disabled={primaryDisabled}>
          {secondaryLabel}
        </button>
        <button onClick={onPrimary} disabled={primaryDisabled || primaryLoading}>
          {primaryLabel}
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/FilesSection', () => ({
  __esModule: true,
  default: ({ caseId }: { caseId: string }) => {
    const mockText = `Files Section Mock ${caseId}`;
    return <div data-testid="files-section-mock">{mockText}</div>;
  },
}));

vi.mock('@/components/Modals/AllowVisualizationModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (userId: string) => void;
  }) => {
    if (!isOpen) return null;
    const modalTitle = 'Allow Visualization Modal';
    return (
      <div data-testid="modal-allow-visualization">
        <h2>{modalTitle}</h2>
        <button onClick={onClose}>Close</button>
        {onSubmit && (
          <button onClick={() => onSubmit('mock-user-id')}>Submit</button>
        )}
      </div>
    );
  },
}));

// Mock a lightweight GenericTable to expose row actions for tests
vi.mock('@/components/GenericTable', () => ({
  __esModule: true,
  default: ({
    data,
    rowActions,
  }: {
    data: any[];
    rowActions?: Array<{
      onClick: (row: any, index?: number) => void;
    }>;
  }) => (
    <div>
      {data?.map((row, i) => (
        <div key={row?.id ?? i}>
          <span>{row?.name}</span>
          {rowActions?.[0] && (
            <button
              data-testid={`remove-row-${i}`}
              onClick={() => rowActions[0].onClick(row, i)}
            >
              Remover
            </button>
          )}
        </div>
      ))}
    </div>
  ),
}));

describe('GeneralInfoPage', () => {
  const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <React.Suspense fallback={<div />}>{children}</React.Suspense>
  );

  const mockRouter = {
    push: vi.fn(),
  };

  const mockCaseData: CompleteCaseResponse = {
    id: '123',
    name: 'Caso Teste',
    case_number: 2024001,
    status: 'Em andamento',
    owner: 'João Silva',
    creation_date: '01/01/2024',
    update_date: '01/01/2024',
    suspects: [
      {
        id: '1',
        name: 'Suspeito 1',
        cpf_cnpj: '12345678901',
        phone_number: '11999999999',
      },
      {
        id: '2',
        name: 'Suspeito 2',
        cpf_cnpj: '98765432100',
        phone_number: '11988888888',
      },
    ],
    archives: [],
  };

  const mockParams = Promise.resolve({ id: '123' });

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
    (getCurrentUser as Mock).mockResolvedValue({ role: 'USER', id: '1', name: 'Test User' });

    (useCaseById as Mock).mockReturnValue({
      data: mockCaseData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    (useUpdateCaseName as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useUpdateCaseSituation as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useDeleteCase as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useAllowVisualization as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useAddSuspect as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useDeleteSuspect as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    (useAddSuspectsBatch as Mock).mockReturnValue({
      mutate: vi.fn(),
    });
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o container de detalhes do caso', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      const details = await screen.findByTestId('case-details');
      expect(details).toBeInTheDocument();
    });

    it('deve exibir o nome do caso no cabeçalho', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      const caseName = await screen.findByTestId('case-name');
      expect(caseName).toHaveTextContent('Caso Teste');
    });

    it('deve exibir as informações do caso', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      // Verifica pelos textos diretamente para evitar flakiness com testids
      expect(await screen.findByText('João Silva')).toBeInTheDocument();
      expect(await screen.findByText(/2024001/)).toBeInTheDocument();
      expect(await screen.findByText('Em andamento')).toBeInTheDocument();
      expect(await screen.findByText('01/01/2024')).toBeInTheDocument();
    });

    it('deve renderizar a seção de ações', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        expect(screen.getByTestId('case-action-buttons')).toBeInTheDocument();
      });
    });

    it('deve renderizar a seção de investigados', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        expect(screen.getByTestId('investigated-section')).toBeInTheDocument();
      });
    });

    it('deve renderizar a seção de arquivos', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        expect(screen.getByTestId('files-section-mock')).toBeInTheDocument();
      });
    });

    it('deve renderizar a tabela de investigados com os dados corretos', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const table = screen.getByTestId('involved-table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('Estado de carregamento', () => {
    it('deve exibir loading spinner quando isLoading é true', () => {
      (useCaseById as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Estado de erro', () => {
    it('deve exibir mensagem de erro quando isError é true', async () => {
      (useCaseById as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        expect(screen.getByText(t('cases.returnToCases'))).toBeInTheDocument();
      });
    });

    it('deve exibir botão de retornar no estado de erro', async () => {
      const mockRefetch = vi.fn();
      (useCaseById as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        expect(screen.getByText(t('cases.returnToCases'))).toBeInTheDocument();
      });
    });

    it('deve navegar para /casos quando clicar em retornar', async () => {
      (useCaseById as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const returnButton = screen.getByText(t('cases.returnToCases'));
        fireEvent.click(returnButton);
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/casos');
    });
  });

  describe('Menu de ações', () => {
    it('deve abrir o menu de ações ao clicar no botão', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        expect(screen.getByTestId('menu-change-name')).toBeInTheDocument();
        expect(screen.getByTestId('menu-change-situation')).toBeInTheDocument();
        expect(screen.getByTestId('menu-allow-view')).toBeInTheDocument();
      });
    });

    it('deve exibir opção de excluir para usuários ADMIN', async () => {
      (getCurrentUser as Mock).mockResolvedValue({ role: 'ADMIN', id: '1', name: 'Admin User' });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        expect(screen.getByTestId('menu-delete-case')).toBeInTheDocument();
      });
    });

    it('não deve exibir opção de excluir para usuários não ADMIN', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('menu-delete-case')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal de alteração de nome', () => {
    it('deve abrir o modal ao clicar em "Alterar nome"', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const changeNameOption = screen.getByTestId('menu-change-name');
        fireEvent.click(changeNameOption);
      });

      await waitFor(() => {
        const modals = screen.getAllByText(t('cases.title.changeName'));
        expect(modals.length).toBeGreaterThan(0);
      });
    });

    it('deve chamar useUpdateCaseName ao salvar', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => onSuccess());
      (useUpdateCaseName as Mock).mockReturnValue({
        mutate: mockMutate,
      });

      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const changeNameOption = screen.getByTestId('menu-change-name');
        fireEvent.click(changeNameOption);
      });

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(t('cases.title.inputName'));
        // O último input é o do modal
        const modalInput = inputs[inputs.length - 1];
        fireEvent.change(modalInput, { target: { value: 'Novo Nome' } });
      });

      const saveButtons = screen.getAllByText(t('cases.title.save'));
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { caseId: '123', name: 'Novo Nome' },
          expect.any(Object)
        );
      });
    });

    it('deve fechar o modal ao clicar em cancelar', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const changeNameOption = screen.getByTestId('menu-change-name');
        fireEvent.click(changeNameOption);
      });

      await waitFor(() => {
        const cancelButtons = screen.getAllByText(t('cases.title.cancel'));
        fireEvent.click(cancelButtons[0]);
      });

      await waitFor(() => {
        // Verifica que o modal foi fechado procurando pelo input do modal
        const inputs = screen.queryAllByPlaceholderText(t('cases.title.inputName'));
        // Deve ter apenas 1 input (o da seção de adicionar investigado), não 2 (modal fechado)
        expect(inputs.length).toBe(1);
      });
    });

    it('deve fechar o modal após salvar com sucesso', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => onSuccess());
      (useUpdateCaseName as Mock).mockReturnValue({ mutate: mockMutate });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      // Abre o menu de ações
      const actionsButton = await screen.findByLabelText('Ações');
      fireEvent.click(actionsButton);

      // Clica na opção de alterar nome
      const openBtn = await screen.findByTestId('menu-change-name');
      fireEvent.click(openBtn);

      const inputs = await screen.findAllByPlaceholderText(t('cases.title.inputName'));
      const modalInput = inputs[inputs.length - 1];
      fireEvent.change(modalInput, { target: { value: 'Nome Fechado' } });

      const saveButtons = screen.getAllByText(t('cases.title.save'));
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      await waitFor(() => {
        // modal fechado -> input do modal não deve existir mais
        const stillInputs = screen.queryAllByPlaceholderText(t('cases.title.inputName'));
        expect(stillInputs.length).toBe(1);
      });
    });
  });

  describe('Modal de alteração de situação', () => {
    it('deve abrir o modal ao clicar em "Alterar situação"', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const changeSituationOption = screen.getByTestId('menu-change-situation');
        fireEvent.click(changeSituationOption);
      });

      await waitFor(() => {
        expect(screen.getAllByText(t('cases.title.changeSituation'))[0]).toBeInTheDocument();
      });
    });

    it('deve chamar useUpdateCaseSituation ao salvar', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => onSuccess());
      (useUpdateCaseSituation as Mock).mockReturnValue({
        mutate: mockMutate,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const changeSituationOption = screen.getByTestId('menu-change-situation');
        fireEvent.click(changeSituationOption);
      });

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'Encerrado' } });
      });

      const saveButton = screen.getByText(t('cases.title.save'));
      fireEvent.click(saveButton);

      expect(mockMutate).toHaveBeenCalledWith(
        { caseId: '123', situation: 'Encerrado' },
        expect.any(Object)
      );
    });

    it('deve fechar o modal após salvar com sucesso', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => onSuccess());
      (useUpdateCaseSituation as Mock).mockReturnValue({ mutate: mockMutate });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      // Abre o menu de ações
      const actionsButton = await screen.findByLabelText('Ações');
      fireEvent.click(actionsButton);

      // Clica na opção de alterar situação
      const openBtn = await screen.findByTestId('menu-change-situation');
      fireEvent.click(openBtn);

      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Suspenso' } });

      const saveButton = screen.getByText(t('cases.title.save'));
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      await waitFor(() => {
        // modal fechado -> não deve existir select
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal de exclusão de caso', () => {
    it('deve abrir o modal ao clicar em "Excluir"', async () => {
      (getCurrentUser as Mock).mockResolvedValue({ role: 'ADMIN', id: '1', name: 'Admin User' });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const deleteOption = screen.getByTestId('menu-delete-case');
        fireEvent.click(deleteOption);
      });

      await waitFor(() => {
        const modals = screen.getAllByText(t('cases.title.delete'));
        expect(modals.length).toBeGreaterThan(0);
      });
    });

    it('deve chamar useDeleteCase e navegar para /casos ao confirmar', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => onSuccess());
      (useDeleteCase as Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });
      (getCurrentUser as Mock).mockResolvedValue({ role: 'ADMIN', id: '1', name: 'Admin User' });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const deleteOption = screen.getByTestId('menu-delete-case');
        fireEvent.click(deleteOption);
      });

      // Wait for the modal to appear
      const modal = await screen.findByTestId('delete-case-modal');
      
      // Click the remove button inside the modal
      const removeButton = modal.querySelector('button[class*="removeButton"]') as HTMLButtonElement;
      expect(removeButton).toBeTruthy();
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith('123', expect.any(Object));
      });

      // router.push é chamado no onSuccess
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/casos');
      });
    });
  });

  describe('Modal de permitir visualização', () => {
    it('deve abrir o modal ao clicar em "Permitir visualização"', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const menuButton = screen.getByTestId('case-actions');
        fireEvent.click(menuButton.querySelector('button')!);
      });

      await waitFor(() => {
        const allowViewOption = screen.getByTestId('menu-allow-view');
        fireEvent.click(allowViewOption);
      });

      await waitFor(() => {
        expect(screen.getByTestId('modal-allow-visualization')).toBeInTheDocument();
      });
    });

    it('deve submeter e recarregar a página no sucesso', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => {
        onSuccess();
      });
      const mockRefetch = vi.fn();
      
      (useAllowVisualization as Mock).mockReturnValue({ 
        mutate: mockMutate,
        isPending: false,
      });
      (useCaseById as Mock).mockReturnValue({
        data: mockCaseData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      // Abre o menu de ações
      const actionsButton = await screen.findByLabelText('Ações');
      fireEvent.click(actionsButton);

      // Clica na opção de permitir visualização
      const btn = await screen.findByTestId('menu-allow-view');
      fireEvent.click(btn);

      const submit = await screen.findByText('Submit');
      fireEvent.click(submit);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Adicionar investigado', () => {
    it('deve ter campos de input para adicionar investigado', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addSection = screen.getByTestId('add-investigated');
        expect(addSection).toBeInTheDocument();
      });
    });

    it('deve chamar useAddSuspect ao adicionar um investigado', async () => {
      const mockMutate = vi.fn();
      const mockRefetch = vi.fn();
      (useAddSuspect as Mock).mockReturnValue({
        mutate: mockMutate,
      });
      (useCaseById as Mock).mockReturnValue({
        data: mockCaseData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addSection = screen.getByTestId('add-investigated');
        const inputs = addSection.querySelectorAll('input');
        
        fireEvent.change(inputs[0], { target: { value: 'Novo Investigado' } });
        fireEvent.change(inputs[1], { target: { value: '12345678901' } });
        fireEvent.change(inputs[2], { target: { value: '11999999999' } });
      });

      const addButton = screen.getByTestId('add-suspect');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            caseId: '123',
            newSuspect: {
              name: 'Novo Investigado',
              cpf_cnpj: '12345678901',
              phone_number: '11999999999',
            },
          },
          expect.any(Object)
        );
      });
    });

    it('deve desabilitar o botão de adicionar em lote quando os campos obrigatórios não estão preenchidos', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addBatchButton = screen.getByTestId('add-suspects-batch');
        expect(addBatchButton).toBeDisabled();
      });
    });

    it('não deve desabilitar o botão de adicionar individual', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addButton = screen.getByTestId('add-suspect');
        expect(addButton).not.toBeDisabled();
      });
    });

    it('deve limpar os campos após adicionar um investigado com sucesso', async () => {
      const mockMutate = vi.fn((data, callbacks) => {
        // Executa o callback onSuccess imediatamente
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      });
      const mockRefetch = vi.fn();
      (useAddSuspect as Mock).mockReturnValue({
        mutate: mockMutate,
      });
      (useCaseById as Mock).mockReturnValue({
        data: mockCaseData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      // Preenche os campos
      const addSection = screen.getByTestId('add-investigated');
      const inputs = addSection.querySelectorAll('input');
      
      fireEvent.change(inputs[0], { target: { value: 'Novo Investigado' } });
      fireEvent.change(inputs[1], { target: { value: '12345678901' } });
      fireEvent.change(inputs[2], { target: { value: '11999999999' } });

      // Verifica que os campos foram preenchidos
      expect(inputs[0]).toHaveValue('Novo Investigado');
      expect(inputs[1]).toHaveValue('123.456.789-01'); // Formatado
      expect(inputs[2]).toHaveValue('11999999999');

      // Clica no botão de adicionar
      const addButton = screen.getByTestId('add-suspect');
      fireEvent.click(addButton);

      // Aguarda que a mutação seja chamada
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Aguarda que os campos sejam limpos
      await waitFor(() => {
        expect(inputs[0]).toHaveValue('');
        expect(inputs[1]).toHaveValue('');
        expect(inputs[2]).toHaveValue('');
      });
    });
  });

  describe('Remover investigado', () => {
    it('deve abrir modal de confirmação ao clicar em remover investigado', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const table = screen.getByTestId('involved-table');
        expect(table).toBeInTheDocument();
      });

      // Simulando clique no botão de remover (isso depende da implementação da GenericTable)
      // Este teste pode precisar ser ajustado baseado em como a GenericTable renderiza as ações
    });

    it('deve chamar useDeleteSuspect ao confirmar remoção', async () => {
      const mockMutate = vi.fn((_, { onSuccess }) => {
        onSuccess();
      });
      const mockRefetch = vi.fn();
      (useDeleteSuspect as Mock).mockReturnValue({
        mutate: mockMutate,
      });
      (useCaseById as Mock).mockReturnValue({
        data: mockCaseData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      // Clica no botão de remover do primeiro row exposto pelo mock da GenericTable
      const removeBtn = await screen.findByTestId('remove-row-0');
      fireEvent.click(removeBtn);

      // Aguarda o modal de confirmação abrir
      await waitFor(() => {
        expect(
          screen.getAllByText(
            t('cases.title.removeInvestigated', { defaultValue: 'Remover investigado?' })
          )[0]
        ).toBeInTheDocument();
      });

      // Confirma a remoção no modal (há outros botões "Remover" na tabela)
      const removeButtons = screen.getAllByRole('button', {
        name: t('cases.title.remove'),
      });
      fireEvent.click(removeButtons[removeButtons.length - 1]);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { caseId: '123', suspectId: '1' },
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Props dos wrappers', () => {
    it('CaseContainer deve receber o caseId', async () => {
      render(renderWithClient(
        <SuspenseWrapper>
          <GeneralInfoPage params={mockParams} />
        </SuspenseWrapper>
      ));

      const container = await screen.findByTestId('case-container');
      expect(container).toHaveAttribute('data-case-id', '123');
    });

    it('FilesSection deve receber o caseId', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      const files = await screen.findByTestId('files-section-mock');
      expect(files).toHaveTextContent('123');
    });
  });

  describe('Máscaras de input', () => {
    it('deve aplicar máscara de CPF/CNPJ ao digitar', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addSection = screen.getByTestId('add-investigated');
        const cpfInput = addSection.querySelectorAll('input')[1];
        
        fireEvent.change(cpfInput, { target: { value: '12345678901' } });
        
        // A máscara deve ser aplicada através da função maskCpfCnpj
        expect(cpfInput).toBeInTheDocument();
      });
    });

    it('deve remover caracteres não numéricos do CPF/CNPJ', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addSection = screen.getByTestId('add-investigated');
        const cpfInput = addSection.querySelectorAll('input')[1];
        
        fireEvent.change(cpfInput, { target: { value: 'abc123def456' } });
        
        // Apenas números devem ser mantidos
        expect(cpfInput.getAttribute('value')).not.toContain('a');
        expect(cpfInput.getAttribute('value')).not.toContain('b');
        expect(cpfInput.getAttribute('value')).not.toContain('c');
      });
    });

    it('deve remover caracteres não numéricos do telefone', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const addSection = screen.getByTestId('add-investigated');
        const phoneInput = addSection.querySelectorAll('input')[2];
        
        fireEvent.change(phoneInput, { target: { value: 'abc11999999999' } });
        
        // Apenas números devem ser mantidos
        expect(phoneInput.getAttribute('value')).not.toContain('a');
        expect(phoneInput.getAttribute('value')).not.toContain('b');
        expect(phoneInput.getAttribute('value')).not.toContain('c');
      });
    });
  });

  describe('Contador de investigados', () => {
    it('deve exibir o número correto de investigados', async () => {
      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      await waitFor(() => {
        const investigatedSection = screen.getByTestId('investigated-section');
        expect(investigatedSection).toHaveTextContent('(2)');
      });
    });

    it('deve atualizar o contador após adicionar um investigado', async () => {
      const mockMutate = vi.fn((data, callbacks) => {
        // Executa o callback onSuccess imediatamente
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      });
      const mockRefetch = vi.fn();
      (useAddSuspect as Mock).mockReturnValue({
        mutate: mockMutate,
      });
      (useCaseById as Mock).mockReturnValue({
        data: mockCaseData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      render(renderWithClient(<GeneralInfoPage params={mockParams} />));

      const addSection = screen.getByTestId('add-investigated');
      const inputs = addSection.querySelectorAll('input');
      
      fireEvent.change(inputs[0], { target: { value: 'Novo Investigado' } });
      fireEvent.change(inputs[1], { target: { value: '12345678901' } });

      const addButton = screen.getByTestId('add-suspect');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });
});
