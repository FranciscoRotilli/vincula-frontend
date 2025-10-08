'use client';

import React, { use, useEffect,useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import { t } from '@/texts';

import styles from './page.module.css';


const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);

  const { id } = use(params);

  useEffect(() => {
    async function fetchSuspects() {
      try {
        const response = await fetch(`/api/cases/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suspects');
        }
        const data = await response.json();
        const suspects = data.suspects || [];
        const options = suspects.map((suspect: { name: string }) => ({
          value: suspect.name,
          label: `${suspect.name}`,
        }));
        setInvestigado(options);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSuspects();
  }, [id]);

  const filterFields: FieldConfig[] = [
    { key: 'investigado', label: t('filter.label1'), type: 'select', options: investigado, placeholder: t('filter.placeholder1') },
    { key: 'cpfCnpj', label: t('filter.label2'), type: 'input', placeholder: t('filter.placeholder2') },
    { key: 'destino', label: t('filter.label3'), type: 'input', placeholder: t('filter.placeholder3') },
    { key: 'baseDados', label: t('filter.label4'), type: 'select', options: baseOptions, placeholder: t('filter.placeholder1') },
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
    <CaseContainer caseId={id} data-testid="aba-vinculos">
      <Filter
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClear}
        customStyles={{
          container: styles.containerOverride,
        }}
      />
      <div data-testid="graph-container">

      </div>
    </CaseContainer>
  );
}