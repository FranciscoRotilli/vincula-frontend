import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import Filter, { FieldConfig, FilterValues } from '../../../src/components/Filter';

const fields: FieldConfig[] = [
  { key: 'caseNumber', label: 'Número do Caso', type: 'input', placeholder: 'Digite o número' },
  { key: 'caseName', label: 'Nome do Caso', type: 'input', placeholder: 'Digite o nome' },
  { key: 'responsible', label: 'Responsável', type: 'input', placeholder: 'Digite o responsável' },
  { 
    key: 'situation', 
    label: 'Situação', 
    type: 'select', 
    options: [
      { value: 'open', label: 'Aberto' },
      { value: 'closed', label: 'Fechado' },
    ],
    placeholder: 'Selecione'
  },
];

describe('Filter', () => {
  it('renders all filter fields', () => {
    render(<Filter fields={fields} onFilter={() => {}} />);

    expect(screen.getByTestId('caseNumber-input')).toBeInTheDocument();
    expect(screen.getByTestId('caseName-input')).toBeInTheDocument();
    expect(screen.getByTestId('responsible-input')).toBeInTheDocument();
    expect(screen.getByTestId('situation-select')).toBeInTheDocument();
  });

  it('renders with default values', () => {
    const defaultValues: FilterValues = {
      caseNumber: '1',
      caseName: 'bar',
      responsible: 'baz',
      situation: 'closed',
    };

    render(<Filter fields={fields} onFilter={() => {}} defaultValues={defaultValues} />);

    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('baz')).toBeInTheDocument();
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });
});
