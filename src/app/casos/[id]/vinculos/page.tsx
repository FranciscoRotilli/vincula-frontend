'use client';

import type { Node, Relationship } from '@neo4j-nvl/base';
import React, { use, useEffect, useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Graph from '@/components/Graph';

import mockData from './MOCK_GRAFO.json';
import styles from './page.module.css';

const calculateInitialZoom = (nodeCount: number) => {
  if (nodeCount < 50) return 1.0;
  if (nodeCount < 100) return 0.7;
  return 0.4;
};

interface AppNode extends Node {
  properties: Record<string, unknown>;
}

interface AppRelationship extends Relationship {
  properties: Record<string, unknown>;
}

interface RawNode {
  id: string;
  name: string;
  identity?: string;
  case_number?: string;
  file_name?: string | string[];
  phone_number?: string | string[];
  type?: string;
}

interface RawEdge {
  id: string;
  source: string;
  target: string;
  quantity?: number;
  file_name?: string | string[];
  rif_involvment?: string;
}

const transformApiData = (apiData: { nodes: RawNode[]; edges: RawEdge[] }) => {
  const nodes: AppNode[] = apiData.nodes.map(rawNode => {
    return {
      id: rawNode.id,
      caption: rawNode.name,
      size: 30,
      color: rawNode.type === 'Person' ? '#f0ad4e' : '#e04141',
      properties: {
        identity: rawNode.identity,
        case_number: rawNode.case_number,
        file_name: Array.isArray(rawNode.file_name) ? rawNode.file_name.join(', ') : rawNode.file_name,
        phone_number: Array.isArray(rawNode.phone_number) ? rawNode.phone_number.join(', ') : rawNode.phone_number,
        type: rawNode.type,
      },
    };
  });
  const rels: AppRelationship[] = apiData.edges.map(rawEdge => {
    return {
      id: rawEdge.id,
      from: rawEdge.source,
      to: rawEdge.target,
      caption: String(rawEdge.quantity || ''),
      properties: {
        file_name: Array.isArray(rawEdge.file_name) ? rawEdge.file_name.join(', ') : rawEdge.file_name,
        quantity: rawEdge.quantity,
        rif_involvment: rawEdge.rif_involvment,
      },
    };
  });
  return { nodes, rels };
}
const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {

  const { nodes: initialNodes, rels: initialRels } = transformApiData(mockData);
  const [graphNodes, setGraphNodes] = useState<AppNode[]>(initialNodes);
  const [graphRels, setGraphRels] = useState<AppRelationship[]>(initialRels);
  const zoom = calculateInitialZoom(graphNodes.length);
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
            zoom={zoom}
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
}