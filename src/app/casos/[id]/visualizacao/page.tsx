import { CaseContainer } from '@/components/CaseContainer';
import { VisualizationTab } from '@/components/VisualizationTab';

export default async function VinculosDadosPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <CaseContainer caseId={params.id}>
      <VisualizationTab caseId={params.id} />
    </CaseContainer>
  );
}
