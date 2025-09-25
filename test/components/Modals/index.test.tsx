import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, vi } from 'vitest';

import Modal from '@/components/Modals';

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
});
