import { useMutation } from '@tanstack/react-query';

import { addSuspect } from '@/services/suspectService';
import { SuspectInput } from '@/types/Cases';

export function useAddSuspect() {
  return useMutation({
    mutationFn: ({ caseId, newSuspect }: { caseId: string; newSuspect: SuspectInput }) =>
      addSuspect(caseId, newSuspect),
  });
}
