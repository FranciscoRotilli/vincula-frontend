/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type { Node, Relationship } from '@neo4j-nvl/base'; 
import React, { use, useEffect,useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Graph from '@/components/Graph';

import styles from './page.module.css';

interface AppNode extends Node {
  properties: Record<string, any>;
}

interface AppRelationship extends Relationship {
  properties: Record<string, any>;
}

const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const nodes: AppNode[] = [
    { id: 'alvo-principal', size: 50, caption: 'vincula', color: '#e04141',  properties: { nome: 'Investigado Principal' } },
  ];

  const rels: AppRelationship[] = [];

  for (let i = 1; i <= 50; i++) {
    const nodeId = `entidade-${i}`;
    nodes.push({
      id: nodeId,
      size: 30,
      caption: `${i}`,
      properties: { nome: `Entidade ${i}` }
    });
    rels.push({
      id: `rel-${i}`,
      from: 'alvo-principal',
      to: nodeId,
      properties: { type: 'envolvido em'}
    });
  }
  const [graphNodes, setGraphNodes] = useState<AppNode[]>(nodes);
  const [graphRels, setGraphRels] = useState<AppRelationship[]>(rels);

  const [filters, setFilters] = useState<FilterValues>({});
  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);

  const { id } = use(params);

  const [selectedElement, setSelectedElement] = useState<AppNode | AppRelationship | null>(null);

  const handleNodeClick = (node: Node) => {
    console.log("Node selected: ", node);
    setSelectedElement(node as AppNode);
  }

  const handleRelationshipClick = (rel: Relationship) => {
    setSelectedElement(rel as AppRelationship);
  }

  const handleCanvasClick = () => {
    setSelectedElement(null);
  }

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
      <div className={styles.graphContainer}>
        <div style={{ flex: 3 }}>
          <Graph
            nodes={graphNodes}
            rels={graphRels}
            height={900}
            onNodeClick={handleNodeClick}
            onRelationshipClick={handleRelationshipClick}
            onCanvasClick={handleCanvasClick}
          />
        </div>

        <div className={styles.detailsPanel}> 
          <h3>Detalhes</h3>
          {selectedElement ? (
            <div>
              <p><strong>ID:</strong> {selectedElement.id}</p>
              <p><strong>Tipo:</strong> {'from' in selectedElement ? 'Relação' : 'Nó'}</p>
              {/* Mostra as propriedades do elemento */}
              <pre>{JSON.stringify(selectedElement.properties, null, 2)}</pre>
            </div>
          ) : (
            <p>Clique em um nó para ver os detalhes.</p>
          )}
        </div>

      </div>
    </CaseContainer>
  );
}