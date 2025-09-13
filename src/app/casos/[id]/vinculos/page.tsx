import React from 'react';

import { CaseContainer } from '@/components/CaseContainer/CaseContainer';

export default async function VinculosPage({ params }: { params: { id: string } }) {
  return (
    <CaseContainer caseId={params.id}>
      <div>
        {}
        <h1>Página de Vínculos do Caso: {params.id}</h1>
      </div>
    </CaseContainer>
  );
}

