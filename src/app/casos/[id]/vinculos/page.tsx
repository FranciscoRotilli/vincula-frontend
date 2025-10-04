'use client';

import React, { use, useEffect, useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Graph from '@/components/Graph'; 
import { t } from '@/texts';

import styles from './page.module.css';

const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const nodes = [
    { id: 'alvo-principal', size: 50, caption: 'vincula', labels: ['Investigado'], properties: { nome: 'Investigado Principal' } },
  ];

  const rels = [];

  for (let i = 1; i <= 50; i++) {
    const nodeId = `entidade-${i}`;
    nodes.push({
      id: nodeId,
      size: 30,
      caption: `${i}`,
      labels: ['Entidade'],
      properties: { nome: `Entidade ${i}` }
    });
    rels.push({
      id: `rel-${i}`,
      from: 'alvo-principal',
      to: nodeId,
      type: 'VINCULADO_A'
    });
  }
  const graphData = { nodes, rels };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filters, setFilters] = useState<FilterValues>({});
  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);

  const { id } = use(params);

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const response = await fetch(`/api/cases/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();
        
        const suspects = data.suspects || [];
        const suspectNames = suspects.map((suspect: { name: string }) => suspect.name);
        setInvestigated(suspectNames);

        const caseArchives = data.archives || [];
        const archiveNames = caseArchives.map((archive: { name: string }) => archive.name);
        setArchives(archiveNames);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCaseData();
  }, [id]);

  return (
    <CaseContainer caseId={id}>
      <Filter
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClear}
        customStyles={{
          container: styles.containerOverride,
        }}
      />
      <div>
        <h1>{t('container.vinculo')}{id}</h1>
        
        <div style={{ marginTop: '20px' }}>
          <Graph nodes={graphData.nodes} rels={graphData.rels} />
        </div>

      </div>
    </CaseContainer>
  );
}