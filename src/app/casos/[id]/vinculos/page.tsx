'use client';

import React, { use, useEffect, useState } from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import GraphFilter from '@/components/GraphFilter';
export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const [investigated, setInvestigated] = useState<string[]>([]);
  const [archives, setArchives] = useState<string[]>([]);

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
    <CaseContainer caseId={id} data-testid="aba-vinculos">
      <GraphFilter
        archives={archives}
        investigated={investigated}
      />
      <div data-testid="graph-container">

      </div>
    </CaseContainer>
  );
}