'use client';

import React, { use, useState, useEffect } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import { t } from '@/texts';


const baseOptions = [
  { value: 'simba', label: 'SIMBA' },
  { value: 'sintel', label: 'SINTEL' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [investigadoOptions, setInvestigadoOptions] = useState<{ value: string; label: string }[]>([]);

  const { id } = use(params);

  useEffect(() => {
    async function fetchSuspects() {
      try {
        const response = await fetch(`/api/cases/${id}/suspects`);
        if (!response.ok) {
          throw new Error('Failed to fetch suspects');
        }
        const suspects = await response.json();
        const options = suspects.map((suspect: { id: string; name: string; cpf_cnpj: string }) => ({
          value: suspect.id,
          label: `${suspect.name} - ${suspect.cpf_cnpj}`,
        }));
        setInvestigadoOptions(options);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSuspects();
  }, [id]);

  const filterFields: FieldConfig[] = [
    { key: 'investigado', label: 'Investigado', type: 'select', options: investigadoOptions, placeholder: 'Selecione' },
    { key: 'cpfCnpj', label: 'CPF/CNPJ', type: 'input', placeholder: 'Digite o CPF ou CNPJ' },
    { key: 'destino', label: 'Destino', type: 'input', placeholder: 'Digite o CPF ou CNPJ de destino' },
    { key: 'baseDados', label: 'Base de dados', type: 'select', options: baseOptions, placeholder: 'Selecione' },
  ];

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