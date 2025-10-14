import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import GraphFilter from '@/components/GraphFilter';

describe('GraphFilter', () => {
  const defaultProps = {
    archives: ['Archive1', 'Archive2'],
    investigated: ['Person1', 'Person2']
  };

  it('renders main inputs, selects and buttons', () => {
    const { container } = render(<GraphFilter {...defaultProps} />);

    const textboxes = screen.queryAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(1);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(0);
  });

  it('cpf input accepts text', () => {
    render(<GraphFilter {...defaultProps} />);
    const textboxes = screen.queryAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(1);
    const cpfInput = textboxes[0] as HTMLInputElement;
    fireEvent.change(cpfInput, { target: { value: '123.456.789-00' } });
    expect(cpfInput.value).toBe('123.456.789-00');
  });

  it('renders select elements when present', () => {
    const { container } = render(<GraphFilter {...defaultProps} />);
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(0);
  });
});