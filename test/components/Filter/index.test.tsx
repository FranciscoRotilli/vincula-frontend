import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import Filter, { FilterValues, SituationOption } from '../../../src/components/Filter';

const situations: SituationOption[] = [
  { value: 'open', label: 'Aberto' },
  { value: 'closed', label: 'Fechado' },
];

describe('Filter', () => {
  it('renders all filter fields', () => {
    render(<Filter onFilter={() => {}} situations={situations} />);
    expect(screen.getByTestId('case-number-input')).toBeInTheDocument();
    expect(screen.getByTestId('case-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('case-responsible-input')).toBeInTheDocument();
    expect(screen.getByTestId('situation-select')).toBeInTheDocument();
  });

  it('calls onFilter with correct values', () => {
    const onFilter = vi.fn();
    render(<Filter onFilter={onFilter} situations={situations} />);

    fireEvent.change(screen.getByTestId('case-number-input'));
    fireEvent.change(screen.getByTestId('case-name-input'));
    fireEvent.change(screen.getByTestId('case-responsible-input'));
    fireEvent.change(screen.getByTestId('situation-select'));
    fireEvent.click(screen.getByTestId('filter-button'));

    expect(onFilter).toHaveBeenCalledOnce();
  });

  it('calls onClear and resets fields', () => {
    const onClear = vi.fn();
    render(<Filter onFilter={() => {}} onClear={onClear} situations={situations} />);

    fireEvent.change(screen.getByTestId('case-number-input'));

    fireEvent.click(screen.getByTestId('clear-button'));

    expect(onClear).toHaveBeenCalled();
    
    expect(screen.queryByDisplayValue('teste')).not.toBeInTheDocument();
  });

  it('renders with default values', () => {
    const defaultValues: FilterValues = {
      caseNumber: '1',
      caseName: 'bar',
      responsible: 'baz',
      situation: 'closed',
    };
    render(<Filter onFilter={() => {}} situations={situations} defaultValues={defaultValues} />);

    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('baz')).toBeInTheDocument();
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });
});
