import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

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

import ConfirmationModal from '../../../src/components/ConfirmationModal';

describe('ConfirmationModal', () => {
  it('renders title, description and children when open', () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={() => {}}
        title="Confirm"
        description="Are you sure?"
        primaryLabel="Yes"
        onPrimary={() => {}}
        secondaryLabel="No"
        onSecondary={() => {}}
      >
        <span data-testid="child">child</span>
      </ConfirmationModal>
    );

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('modal-desc')).toHaveTextContent('Are you sure?');
    expect(screen.getByTestId('modal-children')).toContainElement(screen.getByTestId('child'));
  });

  it('calls onPrimary when action button is clicked', () => {
    const onPrimary = vi.fn();
    render(
      <ConfirmationModal
        isOpen
        onClose={() => {}}
        title="Confirm"
        primaryLabel="Yes"
        onPrimary={onPrimary}
        secondaryLabel="No"
        onSecondary={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('modal-action'));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        title="Confirm"
        primaryLabel="Yes"
        onPrimary={() => {}}
        secondaryLabel="No"
        onSecondary={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('modal-cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('passes action color "error" when primaryColor is error', () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={() => {}}
        title="Confirm"
        primaryLabel="Delete"
        onPrimary={() => {}}
        secondaryLabel="Cancel"
        onSecondary={() => {}}
        primaryColor="error"
      />
    );

    expect(screen.getByTestId('modal-action')).toHaveAttribute('data-color', 'error');
  });
});
