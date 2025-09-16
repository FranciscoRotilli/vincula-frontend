import React from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import { t } from '@/texts'

export default async function visualizacaoDosDadosPage({ params }: { params: { id: string } }) {
  return (
    <CaseContainer caseId={params.id}>
      <div>
        {}
        <h1>{t('container.vis')} {params.id}</h1>
      </div>
    </CaseContainer>
  );
}

