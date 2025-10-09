'use client';

import React, { useEffect,useState } from 'react';

import Filter, { FieldConfig, FilterValues } from '../Filter';
import filterStyles from '../Filter/Filter.module.css';

type GraphFilterProps = {
  archives: string[];
  investigated: string[];
};

const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SITTEL', label: 'SITTEL' },
  { value: 'RIF', label: 'RIF' },
];

export default function GraphFilter({ archives, investigated }: Readonly<GraphFilterProps>) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [archivesOptions, setArchivesOptions] = useState<{ value: string; label: string }[]>([]);
  const [investigatedOptions, setInvestigatedOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    setInvestigatedOptions(investigated.map(item => ({ value: item, label: item })));
  }, [investigated]);

  useEffect(() => {
    setArchivesOptions(archives.map(item => ({ value: item, label: item })));
  }, [archives]);

  const filterFields: FieldConfig[] = [
    {
      key: 'investigated',
      label: 'Investigado',
      type: 'select',
      options: investigatedOptions,
      placeholder: 'Selecione',
    },
    {
      key: 'cpf_cnpj',
      label: 'CPF/CNPJ',
      type: 'input',
      placeholder: 'Digite o CPF/CNPJ',
      isCpfCnpjField: true,
    },
    {
      key: 'origin',
      label: 'Origem',
      type: 'select',
      options: baseOptions,
      placeholder: 'Selecione',
    },
    {
      key: 'archive',
      label: 'Arquivo',
      options: archivesOptions,
      type: 'select',
      placeholder: 'Selecione',
    },
  ];

  const handleFilter = (newFilters: FilterValues) => {
    console.log('Filtros aplicados:', newFilters);
    setFilters(newFilters);
  };

  const handleClear = () => {
    console.log('Filtros limpados');
    setFilters({});
  };

  return (
    <Filter 
      fields={filterFields} 
      onFilter={handleFilter} 
      onClear={handleClear}
      customStyles={{
        container: filterStyles.containerOverride
      }}
    />
  );
}
