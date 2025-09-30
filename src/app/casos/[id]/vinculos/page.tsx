'use client';

import React, { use, useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import { t } from '@/texts';


const investigadoOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

const baseOptions = [
  { value: 'simba', label: 'SIMBA' },
  { value: 'sintel', label: 'SINTEL' },
];

const filterFields: FieldConfig[] = [
  { key: 'investigado', label: 'Investigado', type: 'select', options: investigadoOptions, placeholder: 'Selecione' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ', type: 'input', placeholder: 'Digite o CPF ou CNPJ' },
  { key: 'destino', label: 'Destino', type: 'input', placeholder: 'Digite o CPF ou CNPJ de destino' },
  { key: 'baseDados', label: 'Base de dados', type: 'select', options: baseOptions, placeholder: 'Selecione' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const [filters, setFilters] = useState<FilterValues>({});

  const { id } = use(params);

  const handleFilter = (newFilters: FilterValues) => {
    console.log('Filtros aplicados:', newFilters);
    setFilters(newFilters);
  };

  const handleClear = () => {
    console.log('Filtros limpos');
    setFilters({});
  };

  return (
    <CaseContainer caseId={id}>
      <Filter
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClear}
      />
      <div data-testid="graph-container">

      </div>
    </CaseContainer>
  );
}