import { CaseContainer } from '@/components/CaseContainer';
import { VisualizationTab } from '@/components/VisualizationTab';

export default async function VinculosDadosPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return (
    <CaseContainer caseId={id}>
      <VisualizationTab caseId={id} />
    </CaseContainer>
  );
}
