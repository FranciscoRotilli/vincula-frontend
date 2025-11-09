import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import ConfirmationModal from '@/components/Modals/ConfirmationModal';

vi.mock('../../../src/components/Modals', () => {
  return {
    __esModule: true,
    default: (props: any) => {
      if (!props.isOpen) return null;
      return React.createElement(
        'div',
        { 'data-testid': 'modal' },
        React.createElement('h1', { 'data-testid': 'modal-title' }, props.title),
        props.description
          ? React.createElement('p', { 'data-testid': 'modal-desc' }, props.description)
          : null,
        React.createElement('div', { 'data-testid': 'modal-children' }, props.children),
        React.createElement(
          'button',
          {
            'data-testid': 'modal-action',
            onClick: props.onAction,
            'data-color': props.actionButtonColor,
            disabled: !!props.actionDisabled,
          },
          props.actionButton
        ),
        React.createElement(
          'button',
          { 'data-testid': 'modal-cancel', onClick: props.onClose },
          props.cancelButton
        )
      );
    },
  };
});

const makeProps = (overrides: Record<string, any> = {}) => ({
  isOpen: true,
  onClose: vi.fn(),
  title: 'Confirm',
  description: 'Are you sure?',
  primaryLabel: 'Yes',
  onPrimary: vi.fn(),
  secondaryLabel: 'No',
  onSecondary: vi.fn(),
  primaryColor: undefined,
  primaryLoading: false,
  primaryLoadingLabel: undefined,
  children: undefined,
  ...overrides,
});

describe('ConfirmationModal', () => {
  it('renders title, description and children when open', () => {
    const props = makeProps({ children: <span data-testid="child">child</span> });
    render(<ConfirmationModal {...props} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('modal-desc')).toHaveTextContent('Are you sure?');
    expect(screen.getByTestId('modal-children')).toContainElement(screen.getByTestId('child'));
  });

  it('calls onPrimary when action button is clicked', () => {
    const onPrimary = vi.fn();
    const props = makeProps({ onPrimary });
    render(<ConfirmationModal {...props} />);

    fireEvent.click(screen.getByTestId('modal-action'));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    const props = makeProps({ onClose });
    render(<ConfirmationModal {...props} />);

    fireEvent.click(screen.getByTestId('modal-cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('passes action color "error" when primaryColor is error', () => {
    const props = makeProps({ primaryColor: 'error', primaryLabel: 'Delete' });
    render(<ConfirmationModal {...props} />);

    expect(screen.getByTestId('modal-action')).toHaveAttribute('data-color', 'error');
  });

  it('shows loading label and disables action when primaryLoading is true', () => {
    const props = makeProps({ primaryLoading: true, primaryLabel: 'Salvar' });
    render(<ConfirmationModal {...props} />);

    expect(screen.getByTestId('modal-action')).toHaveTextContent(/Salvando|Salvarndo|Salvando/i);
    expect(screen.getByTestId('modal-action')).toBeDisabled();
  });

  it('uses explicit primaryLoadingLabel when provided', () => {
    const props = makeProps({
      primaryLoading: true,
      primaryLabel: 'Excluir',
      primaryLoadingLabel: 'Excluindo...',
    });
    render(<ConfirmationModal {...props} />);

    expect(screen.getByTestId('modal-action')).toHaveTextContent(/Excluindo/i);
    expect(screen.getByTestId('modal-action')).toBeDisabled();
  });
});
