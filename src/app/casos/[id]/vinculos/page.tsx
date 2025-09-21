import React from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import { t } from '@/texts'

export default async function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseContainer caseId={id}>
      <div>
        {}
        <h1> {t('container.vinculo')} {id}</h1>
      </div>
    </CaseContainer>
  );
}