import { CaseContainer } from '@/components/CaseContainer';
import { VisualizationTab } from '@/components/VisualizationTab';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VinculosDadosPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <CaseContainer caseId={id}>
      <VisualizationTab caseId={id} />
    </CaseContainer>
  );
}
