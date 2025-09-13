import React from 'react';

import { CaseContainer } from '@/components/CaseContainer/CaseContainer';

export default async function Visualização_dos_dadosPage({ params }: { params: { id: string } }) {
  return (
    <CaseContainer caseId={params.id}>
      <div>
        {}
        <h1>Página de Visualização dos dados: {params.id}</h1>
      </div>
    </CaseContainer>
  );
}

