import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';

// Importação corrigida para usar o alias de caminho
import Modal from '@/components/modalGenerico/Modal';

// Mock do CSS Module também usando o alias para consistência
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
  }
}));

describe('Componente Modal', () => {
  // Teste 1: Não deve renderizar nada se a prop 'isOpen' for false
  test('não deve renderizar quando isOpen é false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Conteúdo do Modal</div>
      </Modal>
    );
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  // Teste 2: Deve renderizar o modal completo quando 'isOpen' for true
  test('deve renderizar o modal com título, conteúdo e ações quando isOpen é true', () => {
    const handleClose = vi.fn();
    const handleAction = vi.fn();

    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Título de Teste"
        actions={<button onClick={handleAction}>Ação</button>}
      >
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Título de Teste')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument();
  });

  // Teste 3: Deve chamar a função onClose ao clicar no botão de fechar
  test('deve chamar onClose ao clicar no botão de fechar (X)', () => {
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

  // Teste 4: Deve chamar a função onClose ao clicar no overlay
  test('deve chamar onClose ao clicar no overlay', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Conteúdo</p>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
        fireEvent.click(overlay);
    }
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // Teste 5: NÃO deve chamar onClose ao clicar dentro do conteúdo do modal
  test('não deve chamar onClose ao clicar dentro do container do modal', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Clique aqui</p>
      </Modal>
    );

    fireEvent.click(screen.getByText('Clique aqui'));

    expect(handleClose).not.toHaveBeenCalled();
  });

  // Teste 6: Deve renderizar sem header ou footer se não forem passadas as props
  test('deve renderizar sem título e ações se as props não forem fornecidas', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Apenas conteúdo</p>
      </Modal>
    );

    const title = screen.queryByRole('heading');
    
    expect(title).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

