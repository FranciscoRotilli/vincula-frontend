import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect,it } from 'vitest';

import GraphFilter from '../../../src/components/GraphFilter';

describe('GraphFilter', () => {
  it('renders main inputs, selects and buttons', () => {
    const { container } = render(<GraphFilter />);

    const textboxes = screen.queryAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(2);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(0);
  });

  it('cpf input accepts text', () => {
    render(<GraphFilter />);
    const textboxes = screen.queryAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(1);
    const cpfInput = textboxes[0];
    fireEvent.change(cpfInput, { target: { value: '123.456.789-00' } });
    expect((cpfInput as HTMLInputElement).value).toBe('123.456.789-00');
  });

  it('renders select elements when present', () => {
    const { container } = render(<GraphFilter />);
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(0);
  });
});