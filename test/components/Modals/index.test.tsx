import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, vi } from 'vitest';

import Modal from '@/components/Modals';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import RemoveModal from '@/components/Modals/RemoveModal';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return <img {...props} />;
  },
}));

vi.mock('@/components/modalGenerico/Modal.module.css', () => ({
  default: {
    overlay: 'overlay',
    container: 'container',
    header: 'header',
    title: 'title',
    closeButton: 'closeButton',
    content: 'content',
    footer: 'footer',
    small: 'small',
    medium: 'medium',
    large: 'large',
  },
}));

vi.mock('@/components/Input', () => ({
  __esModule: true,
  default: ({ value = '', onChange, ...rest }: any) => (
    <input
      data-testid="mock-input"
      value={value}
      onChange={(event) => onChange?.(event)}
      {...rest}
    />
  ),
}));

vi.mock('@/components/Modals/RemoveModal.module.css', () => ({
  default: {
    modalContainer: 'modalContainer',
    closeButtonContainer: 'closeButtonContainer',
    closeButton: 'closeButton',
    title: 'title',
    description: 'description',
    buttons: 'buttons',
    removeButton: 'removeButton',
  },
}));

describe('Componente Modal', () => {

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Conteúdo do Modal</div>
      </Modal>
    );
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render the modal with title, content and actions', () => {
    const handleClose = vi.fn();
    const handleAction = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Título de Teste" onAction={handleAction} actionButton="Ação">
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Título de Teste')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument();
  });

  it('should close the modal when clicking the close button', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Fechar');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render without title and actions when propers were not provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Apenas conteúdo</p>
      </Modal>
    );

    const title = screen.queryByRole('heading');
    expect(title).not.toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Fechar');
  });

  it('should disable the action button when actionDisabled is true', () => {
    const handleAction = vi.fn();

    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        onAction={handleAction}
        actionButton="Salvar"
        actionDisabled
      >
        <p>Conteúdo</p>
      </Modal>
    );

    const actionButton = screen.getByRole('button', { name: /Salvar/i });
    expect(actionButton).toBeDisabled();
  });
});

describe('RemoveModal', () => {
  it('disables the remove button while processing', () => {
    render(
      <RemoveModal
        title="Remover arquivo"
        description="Deseja remover?"
        isOpen
        onClose={() => {}}
        onRemove={() => {}}
        isProcessing
      />
    );

    const removeButton = screen.getByRole('button', { name: /Removendo/i });
    expect(removeButton).toBeDisabled();
  });

  it('calls onRemove when clicking remove and enabled', () => {
    const onRemove = vi.fn();

    render(
      <RemoveModal
        title="Remover arquivo"
        description="Deseja remover?"
        isOpen
        onClose={() => {}}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Remover/i }));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('CreateCaseModal', () => {
  const renderModal = (props: Partial<React.ComponentProps<typeof CreateCaseModal>> = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
      ...props,
    } as React.ComponentProps<typeof CreateCaseModal>;

    render(<CreateCaseModal {...defaultProps} />);
    return defaultProps;
  };

  it('disables the submit button when case name is empty', async () => {
    renderModal();
    const submitButton = await screen.findByRole('button', { name: /Adicionar/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state and disables while isSubmitting is true', async () => {
    renderModal({ isSubmitting: true });

    const submitButton = await screen.findByRole('button', { name: /Adicionando/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with the provided case name when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    const nameInput = await screen.findByPlaceholderText('Digite o nome do caso');
    fireEvent.change(nameInput, { target: { value: 'Caso Teste' } });

    const submitButton = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ caseName: 'Caso Teste' });
    });
  });
});
