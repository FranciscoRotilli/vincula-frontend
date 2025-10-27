import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import MultiSelectDropdown, { type Option } from '../../../src/components/MultiSelectDropdown';

const MANY_OPTIONS: Option[] = Array.from({ length: 12 }).map((_, i) => ({
  value: `a${i + 1}`,
  label: `Opção A${i + 1}`,
}));

const FEW_OPTIONS: Option[] = [
  { value: 'a1', label: 'Opção A1' },
  { value: 'a2', label: 'Opção A2' },
  { value: 'a3', label: 'Opção A3' },
  { value: 'a4', label: 'Opção A4' },
];

function setup(
  options: Option[] = FEW_OPTIONS,
  customProps: Partial<React.ComponentProps<typeof MultiSelectDropdown>> = {}
) {
  const onChange = vi.fn();
  render(
    <MultiSelectDropdown
      options={options}
      placeholder="Selecionar"
      {...customProps}
      onChange={customProps.onChange ?? onChange}
    />
  );
  const field = screen.getByRole('button', { name: /seleção múltipla/i });
  return { field, onChange };
}

describe('MultiSelectDropdown (essencial)', () => {
  it('renders placeholder and opens/closes the list', () => {
    const { field } = setup();

    expect(screen.getByText('Selecionar')).toBeInTheDocument();

    fireEvent.click(field);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('visually limits the menu to 4 items (scrollable list)', () => {
    const { field } = setup(MANY_OPTIONS);

    fireEvent.click(field);
    const listbox = screen.getByRole('listbox') as HTMLElement;

    expect(listbox.style.maxHeight).toContain('calc(1.313rem * 6.5 + 8px)');

    expect(within(listbox).getAllByRole('option')).toHaveLength(MANY_OPTIONS.length);
  });

  it('selects multiple options and displays the chips (called onChange)', () => {
    const { field, onChange } = setup();

    fireEvent.click(field);
    const listbox = screen.getByRole('listbox');

    fireEvent.click(within(listbox).getByRole('option', { name: 'Opção A1' }));
    fireEvent.click(within(listbox).getByRole('option', { name: 'Opção A2' }));

    expect(screen.queryByText('Selecionar')).not.toBeInTheDocument();

    expect(within(field).getByText('Opção A1')).toBeInTheDocument();
    expect(within(field).getByText('Opção A2')).toBeInTheDocument();

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual(expect.arrayContaining(['a1', 'a2']));
  });

  it('remove chip by “×” and update selection', () => {
    const { field, onChange } = setup(FEW_OPTIONS, { defaultSelected: ['a1', 'a2'] });

    expect(within(field).getByText('Opção A1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remover opção a1/i }));
    expect(within(field).queryByText('Opção A1')).not.toBeInTheDocument();

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual(expect.arrayContaining(['a2']));
    expect(last).not.toEqual(expect.arrayContaining(['a1']));
  });

  it('does not expand when disabled', () => {
    const { field } = setup(FEW_OPTIONS, { disabled: true });

    fireEvent.click(field);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('MultiSelectDropdown (estresse)', () => {
  it('remains stable with many selections and keeps the menu functional', () => {
    const { field, onChange } = setup(MANY_OPTIONS);

    fireEvent.click(field);
    const listbox = screen.getByRole('listbox');

    ['Opção A1', 'Opção A2', 'Opção A3', 'Opção A4', 'Opção A5', 'Opção A6'].forEach((label) => {
      fireEvent.click(within(listbox).getByRole('option', { name: label }));
    });

    ['Opção A1', 'Opção A2', 'Opção A3', 'Opção A4', 'Opção A5', 'Opção A6'].forEach((label) => {
      expect(within(field).getByText(label)).toBeInTheDocument();
    });

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual(expect.arrayContaining(['a1', 'a2', 'a3', 'a4', 'a5', 'a6']));

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(field);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Opção A12' }));
    expect(within(field).getByText('Opção A12')).toBeInTheDocument();
  });
});
