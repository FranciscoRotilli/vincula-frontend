'use client';

import React, { useState } from 'react';

import Filter, { FieldConfig, FilterValues } from '../Filter';
import filterStyles from '../Filter/Filter.module.css';

const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export default function GraphFilter(
  ) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);



  const filterFields: FieldConfig[] = [
    {
      key: 'investigado',
      label: 'Investigado',
      type: 'select',
      options: investigado,
      placeholder: 'Selecione',
    },
    {
      key: 'cpfCnpj',
      label: 'CPF/CNPJ',
      type: 'input',
      placeholder: 'Digite o CPF/CNPJ',
      isCpfCnpjField: true,
    },
    {
      key: 'destino',
      label: 'Destino',
      type: 'input',
      placeholder: 'Digite o CPF/CNPJ de destino',
      isCpfCnpjField: true,
    },
    {
      key: 'baseDados',
      label: 'Base de dados',
      type: 'select',
      options: baseOptions,
      placeholder: 'Selecione',
    },
  ];

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
  };

  return (
    <div className={filterStyles.containerOverride}>
      <Filter
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClear}
      />
    </div>
  );
}
