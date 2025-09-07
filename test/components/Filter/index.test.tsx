import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import Filter, { FilterValues, SituationOption } from '../../../src/components/filter/Filter';

const situations: SituationOption[] = [
  { value: 'open', label: 'Aberto' },
  { value: 'closed', label: 'Fechado' },
];

describe('Filter', () => {
  it('renders search input and filter button', () => {
    render(<Filter onFilter={() => {}} situations={situations} />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders all filter fields', () => {
    render(<Filter onFilter={() => {}} situations={situations} />);
    expect(screen.getByPlaceholderText('Insira o número do caso')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira o nome do caso')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira o responsável')).toBeInTheDocument();
    expect(screen.getByLabelText('Situação')).toBeInTheDocument();
  });

  it('calls onFilter with correct values', () => {
    const onFilter = vi.fn();
    render(<Filter onFilter={onFilter} situations={situations} />);
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'busca' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o número do caso'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o nome do caso'), { target: { value: 'Caso X' } });
    fireEvent.change(screen.getByPlaceholderText('Insira o responsável'), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText('Situação'), { target: { value: 'open' } });
    fireEvent.click(screen.getByRole('button'));
    expect(onFilter).toHaveBeenCalledWith({
      search: 'busca',
      caseNumber: '123',
      caseName: 'Caso X',
      responsible: 'João',
      situation: 'open',
    });
  });

  it('calls onClear and resets fields', () => {
    const onClear = vi.fn();
    render(<Filter onFilter={() => {}} onClear={onClear} situations={situations} />);
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'busca' } });
    const clearButton = screen.getByRole('button', { name: /limpar filtros/i });
    fireEvent.click(clearButton);
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Buscar...')).toHaveValue('');
  });

  it('disables all fields and buttons when disabled', () => {
    render(<Filter onFilter={() => {}} situations={situations} disabled />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByPlaceholderText('Insira o número do caso')).toBeDisabled();
    expect(screen.getByPlaceholderText('Insira o nome do caso')).toBeDisabled();
    expect(screen.getByPlaceholderText('Insira o responsável')).toBeDisabled();
    expect(screen.getByLabelText('Situação')).toBeDisabled();
  });

  it('renders with default values', () => {
    const defaultValues: FilterValues = {
      search: 'foo',
      caseNumber: '1',
      caseName: 'bar',
      responsible: 'baz',
      situation: 'closed',
    };
    render(<Filter onFilter={() => {}} situations={situations} defaultValues={defaultValues} />);
    expect(screen.getByPlaceholderText('Buscar...')).toHaveValue('foo');
    expect(screen.getByPlaceholderText('Insira o número do caso')).toHaveValue('1');
    expect(screen.getByPlaceholderText('Insira o nome do caso')).toHaveValue('bar');
    expect(screen.getByPlaceholderText('Insira o responsável')).toHaveValue('baz');
    expect(screen.getByLabelText('Situação')).toHaveValue('closed');
  });
});